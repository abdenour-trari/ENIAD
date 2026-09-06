import { useEffect, useRef } from "react";
import Spinner from "./Spinner.jsx";

const ChatBox = ({ messages, loading, darkMode }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      className={`flex-1 p-4 rounded-lg border overflow-y-auto ${
        darkMode
          ? "bg-[#161b22] border-[#30363d] text-gray-200"
          : "bg-gray-50 border-gray-300 text-gray-900"
      }`}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
        >
          <span
            className={`inline-block px-3 py-2 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-gray-700 text-gray-100"
                : "bg-gray-300 text-gray-900"
            }`}
          >
            {msg.content}
          </span>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start my-4">
          <Spinner />
          <span className="italic text-gray-500">Ecrit</span>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;
