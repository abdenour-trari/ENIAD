import { useState } from "react";
import "../CSS/App.css";
import questions from "../Data/data";

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption("");
    setIsAnswered(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption("");
    setIsAnswered(false);
  };

  const verifyOption = (e) => {
    const valeur = e.target.value;
    setSelectedOption(valeur);
    setIsAnswered(true);
    if (valeur === questions[currentIndex].answer) {
      setScore((prev) => prev + 1);
    }
  };

  // ✅ Empêcher les erreurs en vérifiant que la question existe
  if (currentIndex >= questions.length) {
    return (
      <div className="QCM">
        <div className="Card">
          <h2>
            Votre score final est {score} sur {questions.length}
          </h2>
          <button onClick={handleRestart}>Rejouer</button>
        </div>
      </div>
    );
  }

  const options = questions[currentIndex].options.map((q, index) => {
    let className = "option-button";
    if (isAnswered) {
      if (q === questions[currentIndex].answer) {
        className += " correct";
      } else if (q === selectedOption && q !== questions[currentIndex].answer) {
        className += " wrong";
      }
    }

    return (
      <button
        key={index}
        value={q}
        className={className}
        onClick={verifyOption}
        disabled={isAnswered}
      >
        {q}
      </button>
    );
  });

  return (
    <div className="QCM">
      <div className="Card">
        <h2>Question {currentIndex + 1}</h2>
        <h4>Votre score : {score}</h4>
        <p className="question">{questions[currentIndex].question}</p>
        <div className="responses">{options}</div>
        <div className="next">
          {isAnswered && currentIndex < questions.length - 1 && (
            <button onClick={handleNext}>Suivant</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
