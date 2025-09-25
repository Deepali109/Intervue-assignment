// // // src/App.jsx
// import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
// import WelcomeScreen from "./components/WelcomeScreen.jsx";
// import TeacherDashboard from "./components/Teacher.jsx";
// import StudentDashboard from "./components/Student.jsx";
// import "./App.css";

// const SOCKET_URL = "http://localhost:5000";

// function App() {
//   const [socket, setSocket] = useState(null);
//   const [userType, setUserType] = useState(null);
//   const [studentName, setStudentName] = useState("");
//   const [isConnected, setIsConnected] = useState(false);
//   const [currentPoll, setCurrentPoll] = useState(null);
//   const [pollResults, setPollResults] = useState(null);
//   const [participants, setParticipants] = useState([]);
//   const [hasAnswered, setHasAnswered] = useState(false);
//   const [isKicked, setIsKicked] = useState(false);
//   const [responseCount, setResponseCount] = useState({
//     responded: 0,
//     total: 0,
//   });
//   const [pollHistory, setPollHistory] = useState([]);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const newSocket = io(SOCKET_URL);
//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       setIsConnected(true);
//       setError(null);
//     });

//     newSocket.on("disconnect", () => {
//       setIsConnected(false);
//     });

//     newSocket.on("poll-started", (poll) => {
//       setCurrentPoll(poll);
//       setPollResults(null);
//       setHasAnswered(poll.hasAnswered || false);
//       setError(null);
//     });

//     newSocket.on("poll-ended", (results) => {
//       setPollResults(results);
//       setCurrentPoll(null);
//       setHasAnswered(false);
//     });

//     newSocket.on("poll-results", (results) => {
//       setPollResults(results);
//     });

//     newSocket.on("participants-update", (participantsList) => {
//       setParticipants(participantsList);
//     });

//     newSocket.on("response-count-update", (data) => {
//       setResponseCount(data);
//     });

//     newSocket.on("student-removed", () => {
//       setIsKicked(true);
//     });

//     newSocket.on("poll-history", (history) => {
//       setPollHistory(history);
//     });

//     newSocket.on("chat-message", (message) => {
//       setChatMessages((prev) => [...prev, message]);
//     });

//     newSocket.on("error", (errorData) => {
//       setError(errorData.message);
//       setTimeout(() => setError(null), 5000);
//     });

//     return () => {
//       newSocket.close();
//     };
//   }, []);

//   const handleUserSelection = (type) => {
//     setUserType(type);
//     if (type === "teacher") {
//       socket.emit("teacher-join");
//     }
//   };

//   const handleStudentJoin = (name) => {
//     setStudentName(name);
//     socket.emit("student-join", name);
//   };

//   const handleCreatePoll = (pollData) => {
//     socket.emit("create-poll", pollData);
//     setError(null);
//   };

//   const handleSubmitResponse = (answer) => {
//     socket.emit("submit-response", { answer });
//     setHasAnswered(true);
//   };

//   const handleRemoveStudent = (studentId) => {
//     socket.emit("remove-student", studentId);
//   };

//   const handleSendChatMessage = (message) => {
//     socket.emit("send-chat-message", { message });
//   };

//   const handleGetPollHistory = () => {
//     socket.emit("get-poll-history");
//   };

//   if (isKicked) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
//           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-red-600 text-xl">⚠️</span>
//           </div>
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">
//             You've been removed from the poll
//           </h2>
//           <p className="text-gray-600 mb-4">
//             The teacher has removed you from the polling system. Please refresh
//             the page to rejoin.
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!userType) {
//     return (
//       <WelcomeScreen
//         onUserSelect={handleUserSelection}
//         isConnected={isConnected}
//       />
//     );
//   }

//   if (userType === "teacher") {
//     return (
//       <TeacherDashboard
//         socket={socket}
//         onCreatePoll={handleCreatePoll}
//         currentPoll={currentPoll}
//         pollResults={pollResults}
//         participants={participants}
//         onRemoveStudent={handleRemoveStudent}
//         isConnected={isConnected}
//         responseCount={responseCount}
//         pollHistory={pollHistory}
//         onGetPollHistory={handleGetPollHistory}
//         chatMessages={chatMessages}
//         onSendChatMessage={handleSendChatMessage}
//         error={error}
//       />
//     );
//   }

//   if (userType === "student" && !studentName) {
//     return (
//       <WelcomeScreen
//         onStudentJoin={handleStudentJoin}
//         isStudent={true}
//         isConnected={isConnected}
//       />
//     );
//   }

//   return (
//     <StudentDashboard
//       studentName={studentName}
//       currentPoll={currentPoll}
//       pollResults={pollResults}
//       onSubmitResponse={handleSubmitResponse}
//       hasAnswered={hasAnswered}
//       isConnected={isConnected}
//       chatMessages={chatMessages}
//       onSendChatMessage={handleSendChatMessage}
//       error={error}
//     />
//   );
// }

// export default App;

// src/App.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import TeacherDashboard from "./components/Teacher.jsx";
import StudentDashboard from "./components/Student.jsx";
import "./App.css";

const SOCKET_URL = "http://localhost:5000";

function App() {
  const [socket, setSocket] = useState(null);
  const [userType, setUserType] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [responseCount, setResponseCount] = useState({
    responded: 0,
    total: 0,
  });
  const [pollHistory, setPollHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("poll-started", (poll) => {
      // Ensure each poll has a unique ID and doesn't carry over previous state
      setCurrentPoll({ ...poll, startTime: Date.now() });
      setPollResults(null);
      // Reset hasAnswered for new polls - don't trust server state for this
      setHasAnswered(false);
      setError(null);
    });

    newSocket.on("poll-ended", (results) => {
      setPollResults(results);
      setCurrentPoll(null);
      setHasAnswered(false);
    });

    newSocket.on("poll-results", (results) => {
      setPollResults(results);
    });

    newSocket.on("participants-update", (participantsList) => {
      setParticipants(participantsList);
    });

    newSocket.on("response-count-update", (data) => {
      setResponseCount(data);
    });

    // Student-specific events
    newSocket.on("answer-submitted", () => {
      // Only set hasAnswered to true when THIS student submits
      setHasAnswered(true);
    });

    newSocket.on("student-removed", () => {
      setIsKicked(true);
    });

    newSocket.on("poll-history", (history) => {
      setPollHistory(history);
    });

    newSocket.on("chat-message", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    newSocket.on("error", (errorData) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleUserSelection = (type) => {
    setUserType(type);
    if (type === "teacher") {
      socket.emit("teacher-join");
    }
  };

  const handleStudentJoin = (name) => {
    setStudentName(name);
    socket.emit("student-join", name);
  };

  const handleCreatePoll = (pollData) => {
    // Add unique ID to poll
    const pollWithId = {
      ...pollData,
      id: Date.now() + Math.random(), // Simple unique ID
      startTime: Date.now(),
    };
    socket.emit("create-poll", pollWithId);
    setError(null);
  };

  const handleSubmitResponse = (answer) => {
    socket.emit("submit-response", { answer });
    // Don't set hasAnswered here - wait for server confirmation
  };

  const handleRemoveStudent = (studentId) => {
    socket.emit("remove-student", studentId);
  };

  const handleSendChatMessage = (message) => {
    socket.emit("send-chat-message", { message });
  };

  const handleGetPollHistory = () => {
    socket.emit("get-poll-history");
  };

  if (isKicked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            You've been removed from the poll
          </h2>
          <p className="text-gray-600 mb-4">
            The teacher has removed you from the polling system. Please refresh
            the page to rejoin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!userType) {
    return (
      <WelcomeScreen
        onUserSelect={handleUserSelection}
        isConnected={isConnected}
      />
    );
  }

  if (userType === "teacher") {
    return (
      <TeacherDashboard
        socket={socket}
        onCreatePoll={handleCreatePoll}
        currentPoll={currentPoll}
        pollResults={pollResults}
        participants={participants}
        onRemoveStudent={handleRemoveStudent}
        isConnected={isConnected}
        responseCount={responseCount}
        pollHistory={pollHistory}
        onGetPollHistory={handleGetPollHistory}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendChatMessage}
        error={error}
      />
    );
  }

  if (userType === "student" && !studentName) {
    return (
      <WelcomeScreen
        onStudentJoin={handleStudentJoin}
        isStudent={true}
        isConnected={isConnected}
      />
    );
  }

  return (
    <StudentDashboard
      studentName={studentName}
      currentPoll={currentPoll}
      pollResults={pollResults}
      onSubmitResponse={handleSubmitResponse}
      hasAnswered={hasAnswered}
      isConnected={isConnected}
      chatMessages={chatMessages}
      onSendChatMessage={handleSendChatMessage}
      error={error}
    />
  );
}

export default App;
