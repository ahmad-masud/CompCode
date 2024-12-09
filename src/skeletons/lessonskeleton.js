import React from "react";
import "../styles/lessonskeleton.css";

const LessonSkeleton = () => {
  return (
    <div className="lesson-skeleton">
      <div className="lesson-skeleton-header skeleton"></div>
      <div className="lesson-skeleton-bottom">
        <div className="lesson-skeleton-sidebar">
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
          <div className="lesson-skeleton-sidebar-item skeleton"></div>
        </div>
        <div className="lesson-skeleton-lessons">
          <div className="lesson-skeleton-bullet skeleton"></div>
          <div className="lesson-skeleton-bullet skeleton"></div>
          <div className="lesson-skeleton-bullet skeleton"></div>
          <div className="lesson-skeleton-paragraph skeleton"></div>
          <div className="lesson-skeleton-paragraph skeleton"></div>
          <div className="lesson-skeleton-code-block skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default LessonSkeleton;
