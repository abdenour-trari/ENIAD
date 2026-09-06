import { useState } from "react";
import questions from "./data";
import "./Css.css";

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isAnswered, setIsAnswerd] = useState(false);

  const handleClick = (option) => {
    setSelectedOption(option);
    setIsAnswerd(true);

    if (option === questions[currentIndex].answer.toString()) {
      setScore((score) => score + 1);
    }
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex) =>
      currentIndex < questions.length ? currentIndex + 1 : currentIndex
    );
    setIsAnswerd(false);
    setSelectedOption("");
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setIsAnswerd(false);
    setSelectedOption("");
    setScore(0);
  };

  if (currentIndex >= questions.length) {
    return (
      <div>
        <h3>
          Vous avez eu {score} bonnes réponses sur {questions.length}
        </h3>
        <button onClick={handleReplay}>Rejouer</button>
      </div>
    );
  }

  // Sinon on affiche la question courante
  return (
    <div>
      <h1>Question {currentIndex + 1}</h1>
      <b>{questions[currentIndex].question}</b>
      <div className="button">
        {questions[currentIndex].options.map((option) => (
          <button
            key={option}
            onClick={() => handleClick(option)}
            disabled={isAnswered}
            className={
              isAnswered
                ? option === questions[currentIndex].answer
                  ? "correct"
                  : option === selectedOption &&
                    option !== questions[currentIndex].answer
                  ? "wrong"
                  : ""
                : "btn"
            }
          >
            {option}
          </button>
        ))}
      </div>
      {isAnswered && <button onClick={handleNext}>Suivant</button>}
    </div>
  );
};

export default App;
