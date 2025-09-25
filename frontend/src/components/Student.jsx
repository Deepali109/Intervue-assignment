// src/components/Student.jsx
const StudentDashboard = ({
  studentName,
  currentPoll,
  pollResults,
  onSubmitResponse,
  hasAnswered,
  isConnected,
  chatMessages,
  onSendChatMessage,
  error,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1); // Add index tracking
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    if (currentPoll && !hasAnswered) {
      const startTime = currentPoll.startTime || Date.now();
      const duration = currentPoll.timeLimit * 1000;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPoll, hasAnswered]);

  // Reset selected answer when new poll starts
  useEffect(() => {
    if (currentPoll && !hasAnswered) {
      setSelectedAnswer("");
      setSelectedIndex(-1); // Reset index too
      setIsSubmitting(false);
    }
  }, [currentPoll?.id, hasAnswered]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isSubmitting || timeLeft <= 0) return;

    setIsSubmitting(true);
    onSubmitResponse(selectedAnswer);

    // Don't reset states here - wait for server confirmation
    // The hasAnswered prop change will handle the UI update
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      onSendChatMessage(chatMessage.trim());
      setChatMessage("");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Fixed option selection handler
  const handleOptionSelect = (option, index) => {
    if (timeLeft <= 0) return;
    setSelectedAnswer(option.text);
    setSelectedIndex(index);
  };

  // Chat Sidebar Component
  const ChatSidebar = () => (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-4">
          <button className="text-sm font-medium text-gray-900 border-b-2 border-blue-500 pb-1">
            Chat
          </button>
          <button className="text-sm text-gray-500 pb-1">Participants</button>
        </div>
        <button
          onClick={() => setShowChat(false)}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No messages yet</p>
        ) : (
          chatMessages.map((msg, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {msg.sender.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-xs">
                      {msg.sender}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {msg.isTeacher ? "Teacher" : "Student"}
                    </span>
                  </div>
                  <div className="text-gray-800 text-sm mt-1">{msg.text}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && chatMessage.trim()) {
                handleSendChat(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleSendChat}
            disabled={!chatMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  // Show waiting screen when no poll is active
  if (!currentPoll && !pollResults) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-xl text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center bg-gradient-to-r from-[#7765DA] to-[#4D0ACD] text-white px-4 py-2 rounded-full text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Interactive Poll
              </div>
            </div>

            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Waiting for the teacher to start the Question...
            </h2>

            <p className="text-gray-600 text-sm mb-6">
              Hello {studentName}! Your teacher will start a poll shortly.
            </p>

            {!isConnected && (
              <p className="text-red-500 text-sm mt-4">
                Connection lost. Trying to reconnect...
              </p>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show poll results
  if (pollResults) {
    // More robust comparison for student's answer
    const studentGotCorrect = pollResults.options.some(
      (option) =>
        option.isCorrect && selectedAnswer.trim() === option.text.trim()
    );

    return (
      <div className="min-h-screen bg-gray-100 flex">
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-medium text-gray-900">
                  Poll Results
                </h1>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  {showChat ? "Hide Chat" : "Show Chat"}
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Result Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      studentGotCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {studentGotCorrect ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {studentGotCorrect ? "Correct!" : "Incorrect"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {studentGotCorrect
                        ? "Great job! You selected the right answer."
                        : "Don't worry, you'll get it next time!"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Poll Question and Results */}
              <div className="bg-gray-600 text-white p-4 rounded-t-lg">
                <h3 className="font-medium">{pollResults.question}</h3>
              </div>

              <div className="border border-gray-200 border-t-0 rounded-b-lg p-4">
                <div className="space-y-2">
                  {pollResults.options.map((option, index) => {
                    const percentage = option.percentage || 0;
                    const count = option.count || 0;
                    const isCorrect = option.isCorrect;
                    const wasSelected =
                      selectedAnswer.trim() === option.text.trim();

                    return (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between py-2 px-3 relative z-10">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                isCorrect ? "bg-green-500" : "bg-purple-500"
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {option.text}
                            </span>
                            {wasSelected && (
                              <span className="text-xs text-purple-600 font-medium">
                                Your Answer
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-xs text-green-600 font-medium">
                                Correct
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {percentage}%
                          </span>
                        </div>
                        <div
                          className={`absolute left-0 top-0 h-full rounded transition-all duration-1000 ${
                            isCorrect ? "bg-green-200" : "bg-purple-200"
                          }`}
                          style={{ width: `${percentage}%`, opacity: 0.5 }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center mt-6">
                <div className="text-sm text-gray-600 mb-2">
                  Total Responses: {pollResults.totalResponses} /{" "}
                  {pollResults.totalStudents}
                </div>
                <div className="text-gray-600 text-sm">
                  Wait for the teacher to ask a new question...
                </div>
              </div>
            </div>
          </div>
        </div>

        {showChat && <ChatSidebar />}
      </div>
    );
  }

  // Show current poll - student already answered
  if (hasAnswered) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Answer Submitted!
            </h2>

            <p className="text-gray-600 text-sm mb-6">
              Thank you for your response. Waiting for other students to
              complete their answers.
            </p>

            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              {showChat ? "Hide Chat" : "Show Chat"}
            </button>

            <div className="text-sm text-gray-500 mt-4">
              Waiting for results...
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {showChat && <ChatSidebar />}
      </div>
    );
  }

  // Show current poll - ready to answer
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-medium text-gray-900">
                  Question {currentPoll.questionNumber || 1}
                </h1>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      timeLeft > 10
                        ? "bg-green-500"
                        : timeLeft > 0
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      timeLeft <= 10 && timeLeft > 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {timeLeft > 0 ? formatTime(timeLeft) : "Time's Up!"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowChat(!showChat)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                {showChat ? "Hide Chat" : "Show Chat"}
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mt-4 text-sm">
                {error}
              </div>
            )}

            {/* Question */}
            <div className="bg-gray-600 text-white p-4 mx-6 mt-6 rounded-t-lg">
              <h3 className="font-medium">{currentPoll.question}</h3>
            </div>

            {/* Answer Options - FIXED SECTION */}
            <div className="border border-gray-200 border-t-0 rounded-b-lg mx-6 p-4">
              <div className="space-y-2">
                {currentPoll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option, index)}
                    className={`w-full text-left p-3 rounded transition-all duration-200 flex items-center space-x-3 ${
                      selectedIndex === index
                        ? "bg-purple-100 border-2 border-purple-500"
                        : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                    } ${
                      timeLeft === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    disabled={timeLeft === 0}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedIndex === index
                          ? "bg-purple-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center border-t border-gray-200">
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  !selectedAnswer ||
                  timeLeft === 0 ||
                  isSubmitting ||
                  !isConnected
                }
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedAnswer && timeLeft > 0 && !isSubmitting && isConnected
                    ? "bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Answer"
                )}
              </button>

              {timeLeft === 0 && (
                <p className="text-red-500 text-sm mt-3 font-medium">
                  Time's up! Waiting for results...
                </p>
              )}

              {!selectedAnswer && timeLeft > 0 && (
                <p className="text-gray-500 text-sm mt-3">
                  Please select an answer before submitting
                </p>
              )}

              {!isConnected && (
                <p className="text-red-500 text-sm mt-3">
                  Connection lost. Trying to reconnect...
                </p>
              )}
            </div>
          </div>

          {/* Wait message */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Wait for the teacher to ask a new question...
            </p>
          </div>
        </div>
      </div>

      {showChat && <ChatSidebar />}
    </div>
  );
};

export default StudentDashboard;
