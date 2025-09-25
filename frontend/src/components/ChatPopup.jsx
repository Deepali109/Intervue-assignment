import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatPopup({ socket, user, participants = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("chatMessage", handler);
    return () => socket.off("chatMessage", handler);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const messageObj = { from: user, message: input };
    socket.emit("chatMessage", messageObj);
    setMessages((prev) => [...prev, messageObj]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("chat")}
                className={`text-sm font-medium ${
                  activeTab === "chat"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`text-sm font-medium ${
                  activeTab === "participants"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500"
                }`}
              >
                Participants
              </button>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeTab === "chat" ? (
              <>
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">
                    No messages yet
                  </p>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        m.from === user ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-lg text-sm max-w-[70%] ${
                          m.from === user
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-xs opacity-70">{m.from}</p>
                        <p>{m.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <ul className="space-y-2">
                {participants.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm">
                    No participants yet
                  </p>
                ) : (
                  participants.map((p) => (
                    <li
                      key={p.id || p.name}
                      className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg text-sm"
                    >
                      <div className="w-6 h-6 bg-purple-500 text-white flex items-center justify-center rounded-full">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{p.name}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {activeTab === "chat" && (
            <form
              onSubmit={send}
              className="border-t p-2 flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type a message..."
                autoFocus
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
