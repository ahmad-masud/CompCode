import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import both styles
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAlerts } from '../context/alertscontext';
import '../styles/solution.css'; // For custom modal styling

const Solution = ({ isOpen, onClose, problemName, solution }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false); // State for handling copy feedback
  const [loading, setLoading] = useState(true);
  const { addAlert } = useAlerts();

  // Fetch the code from GitHub when the modal opens
  useEffect(() => {
    setLoading(true);
    setError('');
    if (solution && isOpen) {
      setCode(solution);
    }
    if (problemName && isOpen) {
      const fetchCode = async () => {
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/kamyu104/LeetCode-Solutions/master/Python/${problemName}.py`
          );
          if (!response.ok) {
            throw new Error('Solution not found');
          }
          const data = await response.text();
          setCode(data);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          addAlert('No solution yet', 'warning');
          setLoading(false);
        }
      };
      fetchCode();
    }
  }, [problemName, isOpen, solution, addAlert]);

  const handleCopy = () => {
    setIsCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Do not render the modal if it's not open
  if (!isOpen || error || loading) return null;

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
      </div>
    </div>
  );
};

export default Solution;