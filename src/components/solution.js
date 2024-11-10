import React, { useState, useEffect } from 'react';
import '../styles/solution.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAlerts } from '../context/alertscontext';

const Solution = ({ problemId, onClose, theme }) => {
  const [solutions, setSolutions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const { addAlert } = useAlerts();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.github.com/repos/ahmad-masud/CompCode-Solutions/contents/${problemId}`);
        if (!response.ok) {
          if (response.status === 404) {
            addAlert('Not available yet', 'warning');
          } else {
            addAlert('Failed to fetch solutions', 'error');
          }
          setLoading(false);
          setFailed(true);
          return; // Exit early for 404 or other non-OK responses
        }

        const data = await response.json();
        const solutionPromises = data.map(async (solution) => {
          if (solution.type === 'dir') {
            try {
              // Fetch info.json
              const infoResponse = await fetch(`https://raw.githubusercontent.com/ahmad-masud/CompCode-Solutions/main/${problemId}/${solution.name}/info.json`);
              if (!infoResponse.ok) throw new Error(`Failed to fetch info.json for ${solution.name}`);

              const infoData = await infoResponse.json();

              // Fetch code.py
              const codeResponse = await fetch(`https://raw.githubusercontent.com/ahmad-masud/CompCode-Solutions/main/${problemId}/${solution.name}/code.py`);
              if (!codeResponse.ok) throw new Error(`Failed to fetch code.py for ${solution.name}`);

              const codeData = await codeResponse.text();

              // Set video URL if not already set
              if (!videoUrl && infoData.video) {
                setVideoUrl(infoData.video);
              }

              return {
                ...infoData,
                code: codeData,
              };
            } catch (innerError) {
              console.error(`Error fetching data for solution ${solution.name}:`, innerError);
              return null;
            }
          }
          return null;
        });

        const loadedSolutions = await Promise.all(solutionPromises);
        setSolutions(loadedSolutions.filter((sol) => sol !== null));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching solutions:', err);
        setLoading(false); // Ensure loading state is cleared even on error
        setFailed(true);
      }
    };

    fetchSolutions();
  }, [problemId, videoUrl, addAlert]);

  const handleCopy = (index) => {
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  if (loading || failed) return null;

  return (
    <div className="solution-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="solution-content">
        <button className="close-button" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>

        {videoUrl && (
          <iframe
            src={`https://www.youtube.com/embed/${videoUrl}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          ></iframe>
        )}

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
      </div>
    </div>
  );
};

export default Solution;