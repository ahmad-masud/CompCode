import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  a11yDark as codeDark,
  oneLight as codeLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "../styles/lesson.css";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/usercontext";
import { useAlerts } from "../context/alertscontext";
import LessonSkeleton from "../skeletons/lessonskeleton";

const Lesson = () => {
  const [lesson, setLesson] = useState(null);
  const [copiedState, setCopiedState] = useState([]);
  const navigate = useNavigate();
  const { theme, premiumInfo, user, completedLessons, setCompletedLesson } =
    useUser();
  const { addAlert } = useAlerts();
  const { lessonId } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const data = await import(`../content/lessons/${lessonId}.json`);
        setLesson(data);

        if (data.premium && !premiumInfo.premium) {
          navigate("/premium");
          return;
        }

        setCopiedState(Array(data.lessons?.length || 0).fill([]));
      } catch (error) {
        console.error("Error loading lesson:", error);
        navigate("/notfound");
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      loadLesson();
    }
  }, [lessonId, premiumInfo, navigate]);

  const handleCheckboxChange = async () => {
    if (!user) {
      addAlert("Sign in to track your progress", "warning");
      return;
    }

    setCompletedLesson(lesson?.title, !completedLessons[lesson?.title]);
  };

  const handleCopy = (lessonIdx, blockIdx) => {
    const updatedState = [...copiedState];
    updatedState[lessonIdx][blockIdx] = true;
    setCopiedState(updatedState);

    setTimeout(() => {
      updatedState[lessonIdx][blockIdx] = false;
      setCopiedState([...updatedState]);
    }, 2000);
  };

  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderParagraphWithHighlights = (text) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <span key={index} className="lesson-highlight">
            {part.slice(1, -1)}
          </span>
        );
      }
      return renderBoldText(part);
    });
  };

  if (isLoading) {
    return <LessonSkeleton />;
  }

  return (
    <div className="lesson-container">
      <p className="lesson-header">
        {lesson && lesson.title}
        <button onClick={handleCheckboxChange}>
          {completedLessons[lesson?.title] ? (
            <i className="fa-solid fa-square-check"></i>
          ) : (
            <i className="fa-regular fa-square"></i>
          )}
        </button>
      </p>
      <div className="lesson-bottom">
        <div className="lesson-sidebar">
          {lesson &&
            lesson.lessons.map((lesson, lessonIdx) => (
              <a
                key={lessonIdx}
                href={`#${lesson.title.replaceAll(" ", "-")}`}
                className="lesson-link"
              >
                {lesson.title}
              </a>
            ))}
        </div>
        <div className="lessons">
          {lesson &&
            lesson.lessons.map((lesson, lessonIdx) => (
              <div key={lessonIdx} className="lesson">
                <p
                  id={lesson.title.replaceAll(" ", "-")}
                  className="lesson-title"
                >
                  {lesson.title}
                </p>
                {lesson.content.map((block, blockIdx) => {
                  if (block.type === "paragraph") {
                    return (
                      <p className="lesson-paragraph" key={blockIdx}>
                        {renderParagraphWithHighlights(block.text)}
                      </p>
                    );
                  }
                  if (block.type === "bullets") {
                    return (
                      <ul className="lesson-list" key={blockIdx}>
                        {block.items.map((item, i) => (
                          <li className="lesson-list-item" key={i}>
                            {renderBoldText(item)}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === "code") {
                    if (!copiedState[lessonIdx]) copiedState[lessonIdx] = [];
                    return (
                      <div key={blockIdx} className="lesson-code-block">
                        <CopyToClipboard
                          text={block.code}
                          onCopy={() => handleCopy(lessonIdx, blockIdx)}
                        >
                          <button className="lesson-copy-button">
                            {copiedState[lessonIdx][blockIdx] ? (
                              <i className="bi bi-check-lg"></i>
                            ) : (
                              <i className="bi bi-copy"></i>
                            )}
                          </button>
                        </CopyToClipboard>
                        <SyntaxHighlighter
                          language={block.language || "python"}
                          style={
                            theme === "dark"
                              ? codeDark
                              : theme === "system"
                                ? window.matchMedia &&
                                  window.matchMedia(
                                    "(prefers-color-scheme: dark)"
                                  ).matches
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
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
