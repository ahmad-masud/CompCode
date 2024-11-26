import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  a11yDark as codeDark,
  oneLight as codeLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "../styles/lesson.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/usercontext";
import { useTheme } from "../context/themecontext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import { useAlerts } from "../context/alertscontext";

const Lesson = ({ data }) => {
  const [lesson, setLesson] = useState(null);
  const [copiedState, setCopiedState] = useState([]);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { premiumInfo, user } = useUser();
  const { theme } = useTheme();
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) return;
    if (data.premium && !premiumInfo.premium) {
      navigate("/premium");
      return;
    }
    setLesson(data);
    setCopiedState(Array(data.lessons?.length || 0).fill(false));

    const checkIfCompleted = async (lessonTitle) => {
      if (!user) return;
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const completedLessons = userSnap.data().completedLessons || {};
        setCompleted(!!completedLessons[lessonTitle]);
      }
    };

    checkIfCompleted(data.title);
    setLoading(false);
  }, [user, data, navigate, premiumInfo]);

  const handleCheckboxChange = async (lessonTitle) => {
    if (!user) {
      addAlert("Sign in to track your progress", "warning");
      return;
    }
    const userRef = doc(firestore, "users", user.uid);
    setCompleted(!completed);

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { completedLessons: { [lessonTitle]: true } });
      } else {
        await updateDoc(userRef, {
          [`completedLessons.${lessonTitle}`]: !completed,
        });
      }
    } catch (error) {
      console.error("Error updating lesson completion:", error);
    }
  };

  const handleCopy = (lessonIdx, blockIdx) => {
    const newCopiedState = [...copiedState];
    newCopiedState[lessonIdx][blockIdx] = true;
    setCopiedState(newCopiedState);

    setTimeout(() => {
      const resetCopiedState = [...copiedState];
      resetCopiedState[lessonIdx][blockIdx] = false;
      setCopiedState(resetCopiedState);
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

  if (loading) return;

  return (
    <div className="lesson-container">
      <p className="lesson-header">
        {lesson.title}
        <button onClick={() => handleCheckboxChange(lesson.title)}>
          {completed ? (
            <i className="fa-solid fa-square-check"></i>
          ) : (
            <i className="fa-regular fa-square"></i>
          )}
        </button>
      </p>
      <div className="lesson-bottom">
        <div className="lesson-sidebar">
          {lesson.lessons.map((lesson, lessonIdx) => (
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
          {lesson.lessons.map((lesson, lessonIdx) => (
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
                        language={"python"}
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
