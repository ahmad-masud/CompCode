import React from "react";
import "../styles/lessoncardskeleton.css";

const LessonCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-image-container skeleton"></div>
      <div className="skeleton-card-text">
        <div className="skeleton skeleton-card-title skeleton"></div>
        <div className="skeleton skeleton-card-difficulty skeleton"></div>
        <div className="skeleton-card-buttons">
          <div className="skeleton skeleton-card-button skeleton"></div>
          <div className="skeleton skeleton-card-button skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default LessonCardSkeleton;
