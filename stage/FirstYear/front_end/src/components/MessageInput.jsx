import { useState } from "react";

const MessageInput = ({ onSend, disabled, darkMode }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex mt-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        placeholder="Écris ton message..."
        disabled={disabled}
        className={`flex-1 px-3 py-2 rounded-l-lg border focus:outline-none ${
          darkMode
            ? "bg-[#0d1117] border-[#30363d] text-gray-200"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
      >
        Envoyer
      </button>
    </div>
  );
};

export default MessageInput;
