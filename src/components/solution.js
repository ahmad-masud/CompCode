import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import both styles
import { CopyToClipboard } from 'react-copy-to-clipboard';
import '../styles/solution.css'; // For custom modal styling

const Solution = ({ isOpen, onClose, code, error }) => {
  const [isCopied, setIsCopied] = useState(false); // State for handling copy feedback

  const handleCopy = () => {
    setIsCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Do not render the modal if it's not open
  if (!isOpen) return null;

  // Get the theme from local storage
  var theme = localStorage.getItem('theme') || 'auto'; // Default to 'auto' if not set
  if (theme === 'auto') {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = isDarkMode ? 'dark' : 'light';
  }

  return (
    <div className="modal-overlay">
      <div className='overlay-backdrop' onClick={onClose}></div>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>
        {error ? (
          <p>{error}</p>
        ) : (
          <div className="code-container">
            <CopyToClipboard text={code} onCopy={() => handleCopy()}>
              <button className="solution-copy-button">
                {isCopied ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  <i className="bi bi-copy"></i>
                )}
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter
              language={'python'}
              style={theme === 'dark' ? materialDark : undefined}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solution;