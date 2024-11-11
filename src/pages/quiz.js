import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase-config';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTheme } from '../context/themecontext';
import { useAlerts } from '../context/alertscontext';
import { useUser } from '../context/usercontext';
import '../styles/quiz.css';

const Quiz = ({ data }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copiedState, setCopiedState] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const currentQuestion = data.questions[currentQuestionIndex];
  const { theme } = useTheme();
  const { addAlert } = useAlerts();
  const { user } = useUser();

  const handleOptionSelect = (index) => {
    setSubmitted(false);
    setSelectedOptionIndex(index);
  };

  const handleNext = async () => {
    setSubmitted(false);

    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
      setShowExplanation(false);
    } else {
      addAlert('Quiz complete', 'success');

      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          await updateDoc(userRef, {
            [`completedQuizzes.${data.title}`]: true,
          });
        } catch (error) {
          console.error('Error recording completed quiz:', error);
          addAlert('Error recording quiz completion.', 'error');
        }
      }
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (selectedOptionIndex === currentQuestion.answerIndex) {
      setShowExplanation(true);
    }
  };

  const handleCopy = (blockIdx) => {
    const newCopiedState = [...copiedState];
    newCopiedState[blockIdx] = true;
    setCopiedState(newCopiedState);

    setTimeout(() => {
      const resetCopiedState = [...copiedState];
      resetCopiedState[blockIdx] = false;
      setCopiedState(resetCopiedState);
    }, 2000);
  };

  const renderBoldAndHighlightedText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
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
      if (block.type === 'paragraph') {
        return (
          <p className="quiz-paragraph" key={index}>
            {renderBoldAndHighlightedText(block.text)}
          </p>
        );
      }
      if (block.type === 'bullets') {
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
      if (block.type === 'code') {
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
                theme === 'dark'
                  ? materialDark
                  : theme === 'system'
                    ? window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches
                      ? materialDark
                      : undefined
                    : undefined
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
        {renderExplanationContent(currentQuestion.explanation.content)}
      </div>
      <div className="quiz-question-panel">
        <p className="quiz-question-title">
          Question {currentQuestionIndex + 1}
        </p>
        <p className="quiz-question-text">
          {renderBoldAndHighlightedText(currentQuestion.question)}
        </p>
        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option-button ${selectedOptionIndex === index ? 'selected' : ''} ${submitted && selectedOptionIndex === index && selectedOptionIndex === currentQuestion.answerIndex ? 'correct' : ''} ${submitted && selectedOptionIndex === index && selectedOptionIndex !== currentQuestion.answerIndex ? 'incorrect' : ''}`}
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
          <>
            <button className="quiz-next-button" onClick={handleNext}>
              Next
            </button>
            <p className="quiz-explanation-after-answer">
              {renderBoldAndHighlightedText(
                currentQuestion.explanationAfterAnswer
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
