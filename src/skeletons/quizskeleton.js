import React from "react";
import "../styles/quizskeleton.css";

const QuizSkeleton = () => {
  return (
    <div className="quiz-skeleton-container">
      <div className="quiz-skeleton-explanation-panel">
        <div className="quiz-skeleton-title skeleton"></div>
        <div className="quiz-skeleton-paragraph skeleton"></div>
        <div className="quiz-skeleton-paragraph skeleton"></div>
        <div className="quiz-skeleton-question-title skeleton"></div>
      </div>
      <div className="quiz-skeleton-question-panel">
        <div className="quiz-skeleton-question-title skeleton"></div>
        <div className="quiz-skeleton-question-title skeleton"></div>
        <div className="quiz-skeleton-option skeleton"></div>
        <div className="quiz-skeleton-option skeleton"></div>
        <div className="quiz-skeleton-option skeleton"></div>
        <div className="quiz-skeleton-option skeleton"></div>
        <div className="quiz-skeleton-button skeleton"></div>
      </div>
    </div>
  );
};

export default QuizSkeleton;
