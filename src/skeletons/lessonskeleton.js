import React from "react";
import "../styles/lessonskeleton.css";

const LessonSkeleton = () => {
  return (
    <div className="lesson-skeleton">
      <div className="lesson-skeleton-header"></div>
      <div className="lesson-skeleton-bottom">
        <div className="lesson-skeleton-sidebar">
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
            <div className="lesson-skeleton-sidebar-item"></div>
        </div>
        <div className="lesson-skeleton-lessons">
            <div className="lesson-skeleton-bullet"></div>
            <div className="lesson-skeleton-bullet"></div>
            <div className="lesson-skeleton-bullet"></div>
            <div className="lesson-skeleton-paragraph"></div>
            <div className="lesson-skeleton-paragraph"></div>
            <div className="lesson-skeleton-code-block"></div>
        </div>
      </div>
    </div>
  );
};

export default LessonSkeleton;
