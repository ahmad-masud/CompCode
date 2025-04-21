import React, { useState } from "react";
import "../styles/solution.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  a11yDark as codeDark,
  oneLight as codeLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { InlineMath } from "react-katex";
import { useUser } from "../context/usercontext";
import "katex/dist/katex.min.css";

const Solution = ({ data, onClose, title, link }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { theme } = useUser();

  if (!data) {
    return null;
  }

  const handleCopy = (index) => {
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="solution-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="solution-content">
        <div className="solution-header">
          <p className="solution-title">
            {title}
            <a href={link} target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-up-right-from-square"></i>
            </a>
          </p>
          <button className="solution-close-button" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <hr className="solution-header-divider" />
        <div className="solution-container">
          {data.video && (
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${data.video}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            </div>
          )}
          <div className="solutions-container">
            {data.solutions.map((solution, index) => (
              <div key={index} className="solution">
                <p className="solution-title">
                  {index + 1}. {solution.title}
                </p>
                <div className="code-container">
                  <a
                    href={`https://github.com/ahmad-masud/LeetCode-Solutions/blob/main/solutions/${data.id}/solution${index + 1}/code.py`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="solution-github-link"
                  >
                    <i className="fa-brands fa-github"></i>
                  </a>
                  <CopyToClipboard
                    text={solution.pythonCode}
                    onCopy={() => handleCopy(index)}
                  >
                    <button className="solution-copy-button">
                      {copiedIndex === index ? (
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
                            window.matchMedia("(prefers-color-scheme: dark)")
                              .matches
                            ? codeDark
                            : codeLight
                          : codeLight
                    }
                  >
                    {solution.pythonCode}
                  </SyntaxHighlighter>
                </div>
                <div className="complexity-container">
                  <p className="complexity-title">Complexity Analysis</p>
                  <div className="complexities">
                    <p className="complexity">
                      Time Complexity:{" "}
                      <InlineMath>{solution.timeComplexity}</InlineMath>
                    </p>
                    <p className="complexity">
                      Space Complexity:{" "}
                      <InlineMath>{solution.spaceComplexity}</InlineMath>
                    </p>
                  </div>
                </div>
                <hr className="solution-divider" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solution;
