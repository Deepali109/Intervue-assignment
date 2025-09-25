// /server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use(cors());
app.use(express.json());

// Serve frontend build
app.use(express.static(path.join(__dirname, "../client/build")));

// Data structures
let currentPoll = null;
let students = {};
let pollHistory = [];
let responses = {};
let pollTimer = null;
let teacherSocket = null;

// Helper function to generate unique IDs
function generateId(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

// Helper function to check if all students have answered
function checkAllStudentsAnswered() {
  const totalStudents = Object.keys(students).length;
  const totalResponses = Object.keys(responses).length;

  console.log(
    `Response check: ${totalResponses}/${totalStudents} students responded`
  );

  // Return true only if we have students AND all have responded
  return totalStudents > 0 && totalResponses >= totalStudents;
}

// Helper function to calculate poll results
function calculateResults() {
  if (!currentPoll) return null;

  const optionCounts = {};
  const totalStudents = Object.keys(students).length;
  let totalResponses = 0;

  // Initialize counts
  currentPoll.options.forEach((option) => {
    optionCounts[option.text] = 0;
  });

  // Count responses
  Object.values(responses).forEach((response) => {
    if (optionCounts.hasOwnProperty(response.answer)) {
      optionCounts[response.answer]++;
      totalResponses++;
    }
  });

  // Calculate percentages
  const optionsWithPercentages = currentPoll.options.map((option) => ({
    ...option,
    count: optionCounts[option.text],
    percentage:
      totalResponses > 0
        ? Math.round((optionCounts[option.text] / totalResponses) * 100)
        : 0,
  }));

  return {
    question: currentPoll.question,
    options: optionsWithPercentages,
    totalResponses,
    totalStudents,
    correctAnswer: currentPoll.correctAnswer,
  };
}

// Helper function to end poll and show results
function endPoll() {
  if (!currentPoll) {
    console.log("No active poll to end");
    return;
  }

  console.log("Ending poll:", currentPoll.question);

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  const results = calculateResults();

  // Add to history
  pollHistory.push({
    id: generateId("poll"),
    question: currentPoll.question,
    options: currentPoll.options,
    results: results,
    timestamp: new Date().toISOString(),
    participants: Object.keys(students).length,
  });

  console.log("Broadcasting final results to all users");

  // Broadcast results to everyone
  io.emit("poll-ended", results);

  // Clear current poll and responses
  currentPoll = null;
  responses = {};

  // Reset student answered status
  Object.keys(students).forEach((socketId) => {
    if (students[socketId]) {
      students[socketId].answered = false;
    }
  });

  console.log("Poll ended successfully");
}

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Teacher joins
  socket.on("teacher-join", () => {
    teacherSocket = socket.id;
    socket.join("teachers");

    // Send current participants list
    const participantsList = Object.values(students).map((student) => ({
      id: student.socketId,
      name: student.name,
    }));

    socket.emit("participants-update", participantsList);

    // Send poll history if available
    socket.emit("poll-history", pollHistory);

    console.log("Teacher joined:", socket.id);
  });

  // Student joins
  socket.on("student-join", (name) => {
    students[socket.id] = {
      name: name.trim(),
      answered: false,
      socketId: socket.id,
      joinedAt: new Date().toISOString(),
    };

    console.log(
      `Student joined: ${name} (${socket.id}). Total students: ${
        Object.keys(students).length
      }`
    );

    // Update participants list for teacher
    const participantsList = Object.values(students).map((student) => ({
      id: student.socketId,
      name: student.name,
    }));

    io.to("teachers").emit("participants-update", participantsList);

    // If there's an active poll, send it to the student
    if (currentPoll) {
      const hasAnswered = responses[socket.id] ? true : false;
      console.log(
        `Sending active poll to ${name}, hasAnswered: ${hasAnswered}`
      );
      socket.emit("poll-started", {
        ...currentPoll,
        hasAnswered,
        startTime: currentPoll.startTime,
      });
    }
  });

  // Teacher creates a poll
  socket.on("create-poll", (pollData) => {
    if (socket.id !== teacherSocket) {
      socket.emit("error", { message: "Only teacher can create polls" });
      return;
    }

    // Check if we can create a new poll - only check if there's currently an active poll
    if (currentPoll) {
      const allStudentsAnswered = checkAllStudentsAnswered();
      if (!allStudentsAnswered) {
        socket.emit("error", {
          message: "Wait for all students to answer before creating a new poll",
        });
        return;
      }
    }

    // Clear previous poll data
    responses = {};
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }

    // Create new poll
    currentPoll = {
      id: generateId("poll"),
      question: pollData.question,
      options: pollData.options,
      timeLimit: pollData.timeLimit || 60,
      correctAnswer: pollData.correctAnswer || pollData.isCorrect,
      startTime: Date.now(),
      createdBy: socket.id,
    };

    // Reset all students' answered status
    Object.keys(students).forEach((studentId) => {
      if (students[studentId]) {
        students[studentId].answered = false;
      }
    });

    console.log(
      `Poll created: "${currentPoll.question}" for ${
        Object.keys(students).length
      } students`
    );

    // Broadcast poll to all students
    io.emit("poll-started", currentPoll);

    // Set timer to automatically end poll
    pollTimer = setTimeout(() => {
      console.log("Poll timer expired, ending poll");
      endPoll();
    }, currentPoll.timeLimit * 1000);
  });

  // Student submits response
  socket.on("submit-response", (data) => {
    if (!currentPoll) {
      socket.emit("error", { message: "No active poll" });
      return;
    }

    if (!students[socket.id]) {
      socket.emit("error", { message: "Student not registered" });
      return;
    }

    if (responses[socket.id]) {
      socket.emit("error", { message: "Already answered" });
      return;
    }

    // Record response
    responses[socket.id] = {
      answer: data.answer,
      timestamp: new Date().toISOString(),
      studentName: students[socket.id].name,
    };

    // Mark student as answered
    students[socket.id].answered = true;

    console.log(`Response from ${students[socket.id].name}: ${data.answer}`);

    // Send live results to everyone
    const results = calculateResults();
    io.emit("poll-results", results);

    // Update response count for teacher
    const totalStudents = Object.keys(students).length;
    const totalResponses = Object.keys(responses).length;

    io.to("teachers").emit("response-count-update", {
      responded: totalResponses,
      total: totalStudents,
    });

    // Check if all students answered
    if (checkAllStudentsAnswered()) {
      console.log("All students have answered, ending poll in 2 seconds");
      setTimeout(() => endPoll(), 2000); // Give time to show final results
    } else {
      console.log(
        `Still waiting for ${totalStudents - totalResponses} more responses`
      );
    }
  });

  // Teacher requests poll history
  socket.on("get-poll-history", () => {
    if (socket.id !== teacherSocket) {
      socket.emit("error", { message: "Only teacher can view history" });
      return;
    }

    socket.emit("poll-history", pollHistory);
  });

  // Teacher removes student
  socket.on("remove-student", (studentId) => {
    if (socket.id !== teacherSocket) {
      socket.emit("error", { message: "Only teacher can remove students" });
      return;
    }

    if (students[studentId]) {
      // Notify the student they were removed
      io.to(studentId).emit("student-removed");

      // Remove from data structures
      delete students[studentId];
      delete responses[studentId];

      // Update participants list
      const participantsList = Object.values(students).map((student) => ({
        id: student.socketId,
        name: student.name,
      }));

      io.to("teachers").emit("participants-update", participantsList);

      console.log(`Student removed: ${studentId}`);
    }
  });

  // Chat message (bonus feature)
  socket.on("send-chat-message", (data) => {
    const student = students[socket.id];
    if (!student && socket.id !== teacherSocket) {
      socket.emit("error", { message: "Not authorized" });
      return;
    }

    const message = {
      id: generateId("msg"),
      text: data.message,
      sender: student ? student.name : "Teacher",
      isTeacher: socket.id === teacherSocket,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to everyone
    io.emit("chat-message", message);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // If teacher disconnects
    if (socket.id === teacherSocket) {
      console.log("Teacher disconnected");
      teacherSocket = null;
      // Don't end the poll, just clear teacher reference
    }

    // If student disconnects
    if (students[socket.id]) {
      const studentName = students[socket.id].name;
      console.log(`Student disconnected: ${studentName}`);

      delete students[socket.id];
      delete responses[socket.id]; // Remove their response if they had one

      // Update participants list for teacher
      const participantsList = Object.values(students).map((student) => ({
        id: student.socketId,
        name: student.name,
      }));

      io.to("teachers").emit("participants-update", participantsList);

      // Update response count for teacher if there's an active poll
      if (currentPoll) {
        const totalStudents = Object.keys(students).length;
        const totalResponses = Object.keys(responses).length;

        io.to("teachers").emit("response-count-update", {
          responded: totalResponses,
          total: totalStudents,
        });

        console.log(
          `After disconnect: ${totalResponses}/${totalStudents} students responded`
        );

        // Check if all remaining students have answered
        if (checkAllStudentsAnswered() && totalStudents > 0) {
          console.log("All remaining students have answered, ending poll");
          setTimeout(() => endPoll(), 2000);
        }
      }
    }
  });
});

// REST API endpoints for additional functionality
app.get("/api/poll/current", (req, res) => {
  res.json({
    success: true,
    poll: currentPoll,
    responses: Object.keys(responses).length,
    totalStudents: Object.keys(students).length,
  });
});

app.get("/api/students", (req, res) => {
  res.json({
    success: true,
    students: Object.values(students).map((s) => ({
      id: s.socketId,
      name: s.name,
      answered: s.answered,
    })),
  });
});

app.get("/api/history", (req, res) => {
  res.json({
    success: true,
    history: pollHistory,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("📊 Live Polling System Ready!");
});
