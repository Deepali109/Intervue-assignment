import React, { useState, useEffect } from "react";

const TeacherDashboard = ({
  socket,
  onCreatePoll,
  currentPoll,
  pollResults,
  participants,
  onRemoveStudent,
  isConnected,
  responseCount,
  pollHistory,
  onGetPollHistory,
  chatMessages,
  onSendChatMessage,
  error,
}) => {
  const [showCreatePoll, setShowCreatePoll] = useState(true);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (currentPoll && !pollResults) {
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
  }, [currentPoll, pollResults]);

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (
      !question.trim() ||
      options.some((opt) => !opt.text.trim()) ||
      !correctAnswer
    ) {
      return;
    }

    const pollData = {
      question: question.trim(),
      options: options.map((opt) => ({
        text: opt.text.trim(),
        isCorrect: opt.text === correctAnswer,
      })),
      timeLimit,
      correctAnswer,
    };

    onCreatePoll(pollData);
    setShowCreatePoll(false);

    setQuestion("");
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setCorrectAnswer("");
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer === options[index].text) {
        setCorrectAnswer("");
      }
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    const oldText = newOptions[index].text;
    newOptions[index].text = value;
    setOptions(newOptions);

    if (correctAnswer === oldText) {
      setCorrectAnswer(value);
    }
  };

  const handleViewHistory = () => {
    onGetPollHistory();
    setShowHistory(true);
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

  const canCreateNewPoll =
    !currentPoll &&
    (!pollResults || responseCount.responded === participants.length);

  const ChatPopup = () => (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border z-50">
      <div className="flex justify-between items-center p-4 border-b bg-purple-600 text-white rounded-t-lg">
        <h3 className="font-medium">Class Chat</h3>
        <button
          onClick={() => setShowChat(false)}
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No messages yet</p>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`text-sm ${
                msg.isTeacher ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg max-w-xs ${
                  msg.isTeacher
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="font-medium text-xs opacity-75 mb-1">
                  {msg.sender}
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendChat} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={!chatMessage.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Poll History</h1>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {pollHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No poll history available
                </p>
              ) : (
                pollHistory.map((poll, index) => (
                  <div
                    key={poll.id || index}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-800">
                        Question {index + 1}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(poll.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 font-medium">
                      {poll.question}
                    </p>

                    <div className="space-y-3">
                      {poll.options?.map((option, optIndex) => {
                        const resultOption = poll.results?.options?.[optIndex];
                        const percentage = resultOption?.percentage || 0;
                        const count = resultOption?.count || 0;

                        return (
                          <div
                            key={optIndex}
                            className="relative overflow-hidden bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between p-3 relative z-10">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    option.isCorrect
                                      ? "bg-green-500"
                                      : "bg-purple-500"
                                  }`}
                                />
                                <span className="text-gray-800">
                                  {option.text}
                                </span>
                                {option.isCorrect && (
                                  <span className="text-green-600 text-sm font-medium">
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-600 font-medium">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div
                              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                                option.isCorrect
                                  ? "bg-green-200"
                                  : "bg-purple-200"
                              }`}
                              style={{ width: `${percentage}%`, opacity: 0.3 }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 text-sm text-gray-500 flex justify-between">
                      <span>
                        Total Responses: {poll.results?.totalResponses || 0}
                      </span>
                      <span>Participants: {poll.participants || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {showChat && <ChatPopup />}
      </div>
    );
  }

  if (showCreatePoll) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex mb-6">
              <div className="inline-flex items-center bg-gradient-to-r from-[#7765DA] to-[#4D0ACD] text-white px-4 py-2 rounded-full text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Intervue Poll
              </div>
            </div>

            <div className=" mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Let's Get Started
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                you'll have the ability to create and manage polls, ask
                questions, and monitor your students' responses in real-time.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePoll} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Enter your question
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={120}>2 minutes</option>
                      <option value={180}>3 minutes</option>
                    </select>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    placeholder="Rahul Bajaj"
                    rows={4}
                    required
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    0/100
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Edit Options
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Is it Correct?
                  </label>
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-sm font-medium">
                        {index + 1}
                      </div>

                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Rahul Bajaj"
                        required
                      />

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={option.text}
                            checked={correctAnswer === option.text}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            required
                          />
                          <span className="text-sm text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`not-correct-${index}`}
                            checked={correctAnswer !== option.text}
                            onChange={() => {}}
                            className="w-4 h-4 text-gray-400"
                          />
                          <span className="text-sm text-gray-700">No</span>
                        </label>
                      </div>

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg
                            className="w-4 h-4"
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
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>+</span>
                    <span>Add More option</span>
                  </button>
                )}
              </div>

              <div className="flex w-full justify-center">
                <button
                  type="submit"
                  disabled={
                    !question.trim() ||
                    options.some((opt) => !opt.text.trim()) ||
                    !correctAnswer ||
                    !isConnected
                  }
                  className="px-10 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white py-3 rounded-2xl font-medium hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Ask Question
                </button>
              </div>
            </form>
          </div>
        </div>

        {showChat && <ChatPopup />}
      </div>
    );
  }

  if (currentPoll || pollResults) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-semibold">
                  {pollResults ? "Poll Results" : "Live Poll"}
                </h1>
                <div className="flex items-center mt-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      pollResults
                        ? "bg-gray-500"
                        : timeLeft > 0
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {pollResults
                      ? "Completed"
                      : timeLeft > 0
                      ? formatTime(timeLeft)
                      : "Time's Up"}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleViewHistory}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  History
                </button>
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Participants ({participants.length})
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm relative"
                >
                  Chat
                  {chatMessages.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chatMessages.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">
                {(currentPoll || pollResults)?.question}
              </h2>

              <div className="space-y-3">
                {((currentPoll || pollResults)?.options || []).map(
                  (option, index) => {
                    const result = pollResults?.options?.[index];
                    const percentage = result?.percentage || 0;
                    const count = result?.count || 0;
                    const isCorrect = option.isCorrect;

                    return (
                      <div
                        key={index}
                        className="relative overflow-hidden bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between p-4 relative z-10">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                isCorrect ? "bg-green-500" : "bg-purple-500"
                              }`}
                            />
                            <span className="text-gray-800">{option.text}</span>
                            {isCorrect && pollResults && (
                              <span className="text-green-600 text-sm font-medium">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                          <span className="text-gray-600 font-medium">
                            {pollResults
                              ? `${count} (${percentage}%)`
                              : `${percentage}%`}
                          </span>
                        </div>
                        {(pollResults || currentPoll) && (
                          <div
                            className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out ${
                              isCorrect ? "bg-green-200" : "bg-purple-200"
                            }`}
                            style={{ width: `${percentage}%`, opacity: 0.3 }}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Responses: {responseCount.responded} / {responseCount.total}
                {pollResults && (
                  <span className="ml-4">
                    Completion Rate:{" "}
                    {responseCount.total > 0
                      ? Math.round(
                          (responseCount.responded / responseCount.total) * 100
                        )
                      : 0}
                    %
                  </span>
                )}
              </div>

              {canCreateNewPoll && (
                <button
                  onClick={() => setShowCreatePoll(true)}
                  disabled={!isConnected}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  + New Question
                </button>
              )}
            </div>

            {showParticipants && (
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Active Participants</h3>
                  <span className="text-sm text-gray-600">
                    {participants.length} online
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {participants.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 col-span-full">
                      No students online
                    </p>
                  ) : (
                    participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-800">
                            {participant.name}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveStudent(participant.id)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showChat && <ChatPopup />}
      </div>
    );
  }
};

export default TeacherDashboard;
