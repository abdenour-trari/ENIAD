import Canvas from "../components/Canvas";
import Sidebar from "../components/Sidebar";
import WordPrompt from "../components/WordPrompt";
import AIAnalysis from "../components/AIAnalysis";

function LetterQuest() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <WordPrompt />

        <Canvas />

        <AIAnalysis />
      </div>

      <Sidebar />
    </div>
  );
}

export default LetterQuest;
