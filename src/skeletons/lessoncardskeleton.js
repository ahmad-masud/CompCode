import React from "react";
import "../styles/lessoncardskeleton.css";

const LessonCardSkeleton = () => {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card-image-container"></div>
        <div className="skeleton-card-text">
          <div className="skeleton skeleton-card-title"></div>
          <div className="skeleton skeleton-card-difficulty"></div>
          <div className="skeleton-card-buttons">
            <div className="skeleton skeleton-card-button"></div>
            <div className="skeleton skeleton-card-button"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default LessonCardSkeleton;