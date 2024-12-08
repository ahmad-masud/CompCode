import React from "react";
import "../styles/lessoncard.css";

const LessonCard = ({
  lesson,
  index,
  image,
  loadedImage,
  handleImageLoad,
  handleLessonClick,
  handleQuizClick,
  completedLessons,
  completedQuizzes,
  premiumInfo,
  titleClass,
}) => {
  return (
    <div key={index} className="lesson-card">
      <div className={`lesson-card-image-container ${titleClass}`}>
        <img
          className={`lesson-card-image ${loadedImage ? "loaded" : "blurred"}`}
          src={image}
          alt={lesson.title}
          onLoad={() => handleImageLoad(lesson.title)}
        />
      </div>
      <div className="lesson-card-text">
        <p className="lesson-card-title">{lesson.title}</p>
        <p className={"lesson-card-difficulty " + lesson.difficulty}>
          {lesson.difficulty[0].toUpperCase() + lesson.difficulty.slice(1) || "N/A"}
        </p>
        <div className="lesson-card-buttons">
          <button
            className={`lesson-card-button ${
              lesson.premium && !premiumInfo.premium ? "disabled" : ""
            }`}
            onClick={() => handleLessonClick(lesson)}
          >
            Lesson
            {completedLessons[lesson.title] && (
              <i className="fa-solid fa-check-circle"></i>
            )}
            {lesson.premium && !premiumInfo.premium && (
              <i className="fa-solid fa-rocket"></i>
            )}
          </button>
          <button
            className="lesson-card-button"
            onClick={() => handleQuizClick(lesson)}
          >
            Quiz{" "}
            {completedQuizzes[lesson.title] && (
              <i className="fa-solid fa-check-circle"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;