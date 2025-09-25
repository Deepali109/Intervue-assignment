import React, { useState } from "react";

const WelcomeScreen = ({
  onUserSelect,
  onStudentJoin,
  isStudent = false,
  isConnected,
}) => {
  const [studentName, setStudentName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (studentName.trim()) {
      onStudentJoin(studentName.trim());
    }
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onUserSelect(selectedRole);
    }
  };

  // Student name entry page (second image)
  if (isStudent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="bg-white w-[600px] shadow-xl rounded-lg p-8 text-center">
          {/* Header Badge */}
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

          {/* Title */}
          <h1 className="text-2xl font-medium text-gray-900 mb-4">
            Let's Get Started
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            If you're a student, you'll be able to{" "}
            <span className="font-medium text-gray-900">
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with
            your classmates
          </p>

          {/* Form */}
          <form onSubmit={handleStudentSubmit} className="space-y-6">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your Name:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                placeholder="Rahul Bajaj"
                required
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedRole || !isConnected}
              className="px-10 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white py-3 rounded-2xl font-medium cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </form>

          {!isConnected && (
            <p className="text-red-500 text-sm text-center mt-4">
              Connecting to server...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Main welcome screen (first image)
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white flex flex-col items-center justify-center rounded-lg p-8 w-auto">
        {/* Header Badge */}
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

        {/* Title */}
        <h1 className="text-2xl font-medium text-gray-900 text-center mb-2">
          Welcome to the{" "}
          <span className="font-semibold">Live Polling System</span>
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-sm text-center mb-8 leading-relaxed">
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        {/* Role Selection Cards */}
        <div className="space-y-3 flex flex-row gap-4 mb-8">
          {/* Student Card */}
          <div
            onClick={() => handleRoleSelection("student")}
            className={`p-4 border-2 w-[320px] h-[130px] rounded-lg cursor-pointer transition-all ${
              selectedRole === "student"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300"
            } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  selectedRole === "student"
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-300"
                }`}
              >
                {selectedRole === "student" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  I'm a Student
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Card */}
          <div
            onClick={() => handleRoleSelection("teacher")}
            className={`p-4 border-2 w-[320px] h-[130px] rounded-lg cursor-pointer transition-all ${
              selectedRole === "teacher"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300"
            } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  selectedRole === "teacher"
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-300"
                }`}
              >
                {selectedRole === "teacher" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  I'm a Teacher
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Submit answers and view the poll results in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole || !isConnected}
          className="px-10 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white py-3 rounded-2xl font-medium cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>

        {!isConnected && (
          <p className="text-red-500 text-sm text-center mt-4">
            Connecting to server...
          </p>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
