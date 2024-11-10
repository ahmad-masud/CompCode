import React, { useState } from 'react';
import '../styles/solution.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Solution = ({ url, onClose, solutions = [], theme }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (index) => {
    setCopiedIndex(index);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="solution-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="solution-content">
        <button className="close-button" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${url}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-iframe"
        ></iframe>

        {solutions.length > 0 && (
          <div className="solutions-container">
            {solutions.map((solution, index) => (
              <div key={index} className="solution">
                <p className='solution-title'>{index + 1}. {solution.title}</p>
                <p className='complexity'>Time Complexity: {solution.timeComplexity}</p>
                <p className='complexity'>Space Complexity: {solution.spaceComplexity}</p>
                <p className="complexity-explanation">{solution.complexityExplanation}</p>
                <div className="code-container">
                  <CopyToClipboard text={solution.code} onCopy={() => handleCopy(index)}>
                    <button className="solution-copy-button">
                      {copiedIndex === index ? (
                        <i className="bi bi-check-lg"></i>
                      ) : (
                        <i className="bi bi-copy"></i>
                      )}
                    </button>
                  </CopyToClipboard>
                  <SyntaxHighlighter
                    language={'python'}
                    style={
                      theme === 'dark'
                        ? materialDark
                        : theme === 'system'
                        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? materialDark : materialLight)
                        : materialLight
                    }
                  >
                    {solution.code}
                  </SyntaxHighlighter>
                </div>
                <hr className="solution-divider" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solution;