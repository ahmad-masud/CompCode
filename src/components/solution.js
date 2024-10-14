import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import both styles
import '../styles/solution.css'; // For custom modal styling

const Solution = ({ isOpen, onClose, problemName, problemTitle }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false); // State for handling copy feedback

  // Fetch the code from GitHub when the modal opens
  useEffect(() => {
    if (problemName && isOpen) {
      const fetchCode = async () => {
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/kamyu104/LeetCode-Solutions/master/Python/${problemName}.py`
          );
          if (!response.ok) {
            throw new Error('Problem not found');
          }
          const data = await response.text();
          setCode(data);
        } catch (error) {
          setError(error.message);
        }
      };
      fetchCode();
    }
  }, [problemName, isOpen]);

  // Handle code copy
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(() => alert('Failed to copy the code'));
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
        <p>{problemTitle}</p>
        <button className="copy-button" onClick={handleCopyCode}>
          <i className={`bi bi-${isCopied ? 'check-lg' : 'copy'}`}></i>
        </button>
        <button className="close-button" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>
        {error ? (
          <p>{error}</p>
        ) : (
          <div className="code-container">
            <SyntaxHighlighter 
              language="python" 
              style={theme === 'dark' ? materialDark : undefined} // Apply style only if dark
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