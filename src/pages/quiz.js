import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  a11yDark as codeDark,
  oneLight as codeLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTheme } from "../context/themecontext";
import { useAlerts } from "../context/alertscontext";
import { useUser } from "../context/usercontext";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/quiz.css";

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copiedState, setCopiedState] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const { theme } = useTheme();
  const { addAlert } = useAlerts();
  const { user } = useUser();
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await import(`../content/quizzes/${quizId}.json`);
        setQuizData(data);
        setCopiedState(Array(data.questions.length).fill(false));
      } catch (error) {
        console.error("Error loading quiz:", error);
        navigate("/notFound");
      }
    };

    loadQuiz();
  }, [quizId, addAlert, navigate]);

  const handleOptionSelect = (index) => {
    setSubmitted(false);
    setSelectedOptionIndex(index);
  };

  const handleNext = async () => {
    setSubmitted(false);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
    } else {
      addAlert("Quiz complete", "success");

      if (user) {
        try {
          const userRef = doc(firestore, "users", user.uid);
          await updateDoc(userRef, {
            [`completedQuizzes.${quizData.title}`]: true,
          });
        } catch (error) {
          console.error("Error recording completed quiz:", error);
          addAlert("Error recording quiz completion.", "error");
        }
      }
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (
      selectedOptionIndex ===
      quizData.questions[currentQuestionIndex].answerIndex
    ) {
      setShowExplanation(true);
    }
  };

  const handleCopy = (blockIdx) => {
    const updatedCopiedState = [...copiedState];
    updatedCopiedState[blockIdx] = true;
    setCopiedState(updatedCopiedState);

    setTimeout(() => {
      updatedCopiedState[blockIdx] = false;
      setCopiedState([...updatedCopiedState]);
    }, 2000);
  };

  const renderBoldAndHighlightedText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <span key={index} className="quiz-highlight">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderExplanationContent = (content) => {
    return content.map((block, index) => {
      if (block.type === "paragraph") {
        return (
          <p className="quiz-paragraph" key={index}>
            {renderBoldAndHighlightedText(block.text)}
          </p>
        );
      }
      if (block.type === "bullets") {
        return (
          <ul className="quiz-list" key={index}>
            {block.items.map((item, i) => (
              <li className="quiz-list-item" key={i}>
                {renderBoldAndHighlightedText(item)}
              </li>
            ))}
          </ul>
        );
      }
      if (block.type === "code") {
        return (
          <div key={index} className="quiz-code-block">
            <CopyToClipboard text={block.code} onCopy={() => handleCopy(index)}>
              <button className="quiz-copy-button">
                {copiedState[index] ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  <i className="bi bi-copy"></i>
                )}
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter
              language={block.language}
              style={
                theme === "dark"
                  ? codeDark
                  : theme === "system"
                    ? window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? codeDark
                      : codeLight
                    : codeLight
              }
            >
              {block.code}
            </SyntaxHighlighter>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="quiz-container">
      <div className="quiz-explanation-panel">
        <p className="quiz-title">Explanation</p>
        {quizData && renderExplanationContent(quizData.questions[currentQuestionIndex].explanation.content)}
      </div>
      <div className="quiz-question-panel">
        <p className="quiz-question-title">
          Question {currentQuestionIndex + 1} of {quizData && quizData.questions.length}
        </p>
        <p className="quiz-question-text">
          {quizData && renderBoldAndHighlightedText(quizData.questions[currentQuestionIndex].question)}
        </p>
        <div className="quiz-options">
          {quizData && quizData.questions[currentQuestionIndex].options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option-button ${selectedOptionIndex === index ? "selected" : ""} ${submitted && selectedOptionIndex === index && selectedOptionIndex === quizData.questions[currentQuestionIndex].answerIndex ? "correct" : ""} ${submitted && selectedOptionIndex === index && selectedOptionIndex !== quizData.questions[currentQuestionIndex].answerIndex ? "incorrect" : ""}`}
              onClick={() => handleOptionSelect(index)}
              disabled={showExplanation}
            >
              {String.fromCharCode(65 + index)}) {option}
            </button>
          ))}
        </div>
        {!showExplanation ? (
          <button
            className="quiz-submit-button"
            onClick={handleSubmit}
            disabled={selectedOptionIndex === null}
          >
            Submit
          </button>
        ) : (
          <button className="quiz-next-button" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
