import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import Prism styles
import { useParams } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard'; // For the copy button
import '../styles/tutorial.css'; // For custom styling

const Tutorial = () => {
  const { tutorialId } = useParams(); // Get the tutorialId from the URL
  const [tutorial, setTutorial] = useState(null);
  const [copiedState, setCopiedState] = useState([]); // Track copied state for each block
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(false); // Track error state

  useEffect(() => {
    // Dynamically import the tutorial based on the tutorialId
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const tutorial = await import(`../content/tutorials/${tutorialId}.json`);
        setTutorial(tutorial);
        setCopiedState(Array(tutorial.lessons.length).fill(false)); // Initialize copiedState with false for each block
        setError(false);
      } catch (error) {
        console.error('Error fetching tutorial:', error);
        setError(true); // Set error to true if the tutorial is not found
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [tutorialId]);

  // Get the theme from local storage or system settings
  const getTheme = () => {
    let theme = localStorage.getItem('theme') || 'auto';
    if (theme === 'auto') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = isDarkMode ? 'dark' : 'light';
    }
    return theme;
  };

  const theme = getTheme();

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="tutorial-fallback">
        <p>No tutorial for this topic, but stay tuned!</p>
      </div>
    );
  }

  const handleCopy = (lessonIdx, blockIdx) => {
    const newCopiedState = [...copiedState];
    newCopiedState[lessonIdx][blockIdx] = true; // Mark the specific block as copied
    setCopiedState(newCopiedState);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      const resetCopiedState = [...copiedState];
      resetCopiedState[lessonIdx][blockIdx] = false;
      setCopiedState(resetCopiedState);
    }, 2000);
  };

  // Helper function to render bold text for items wrapped in double asterisks (**bold**)
  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Render paragraphs with bold text based on **double asterisks**
  const renderParagraphWithHighlights = (text) => {
    // Split the paragraph text by backticks
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        // Remove the backticks and return highlighted span
        return (
          <span key={index} className="tutorial-highlight">
            {part.slice(1, -1)}
          </span>
        );
      }
      return renderBoldText(part); // Render bold text if double asterisks are present
    });
  };

  return (
    <div className="tutorial-container">
      <p className="tutorial-title">{tutorial.title}</p>
      {tutorial.lessons.map((lesson, lessonIdx) => (
        <div key={lessonIdx} className="lesson">
          <p className="lesson-title">{lesson.title}</p>
          {lesson.content.map((block, blockIdx) => {
            if (block.type === 'paragraph') {
              return (
                <p className="lesson-paragraph" key={blockIdx}>
                  {renderParagraphWithHighlights(block.text)}
                </p>
              );
            }
            if (block.type === 'bullets') {
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
            if (block.type === 'code') {
              if (!copiedState[lessonIdx]) copiedState[lessonIdx] = []; // Ensure substate is an array
              return (
                <div key={blockIdx} className="tutorial-code-block">
                  <CopyToClipboard text={block.code} onCopy={() => handleCopy(lessonIdx, blockIdx)}>
                    <button className="tutorial-copy-button">
                      {copiedState[lessonIdx][blockIdx] ? (
                        <i className="bi bi-check-lg"></i>
                      ) : (
                        <i className="bi bi-copy"></i>
                      )}
                    </button>
                  </CopyToClipboard>
                  <SyntaxHighlighter
                    language={block.language}
                    style={theme === 'dark' ? materialDark : undefined}
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
  );
};

export default Tutorial;