import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import '../styles/solution.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useAlerts } from '../context/alertscontext';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Solution = ({ problemId, onClose, theme }) => {
  const [solutions, setSolutions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const { addAlert } = useAlerts();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fetchSolutions = async () => {
      setLoading(true);
      setFailed(false);
      setSolutions([]); // Reset solutions state on each new fetch

      try {
        // Use Axios to fetch content from GitHub API with Authorization Header
        const headers = {
          'Authorization': `token ${process.env.REACT_APP_GITHUB_TOKEN}`, // Ensure you have this set up in your environment variables
          'Accept': 'application/vnd.github.v3.raw' // Return raw content
        };

        // Fetch the main directory content
        const response = await axios.get(`https://api.github.com/repos/ahmad-masud/CompCode-Solutions/contents/${problemId}`, {
          headers
        });

        if (response.status !== 200) {
          addAlert('Failed to fetch solutions', 'error');
          setFailed(true);
          return; // Exit early on non-200 response
        }

        const data = response.data;
        const solutionPromises = data.map(async (solution) => {
          if (solution.type === 'dir') {
            try {
              // Fetch info.json using Axios
              const infoResponse = await axios.get(`https://raw.githubusercontent.com/ahmad-masud/CompCode-Solutions/main/${problemId}/${solution.name}/info.json`);
              const infoData = infoResponse.data;

              // Fetch code.py using Axios
              const codeResponse = await axios.get(`https://raw.githubusercontent.com/ahmad-masud/CompCode-Solutions/main/${problemId}/${solution.name}/code.py`);
              const codeData = codeResponse.data;

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
              return null; // Return null on inner fetch error to avoid breaking other solutions
            }
          }
          return null;
        });

        const loadedSolutions = await Promise.all(solutionPromises);
        setSolutions(loadedSolutions.filter((sol) => sol !== null));
      } catch (err) {
        console.error('Error fetching solutions:', err);
        addAlert('Not available yet', 'warning');
        setFailed(true);
      } finally {
        setLoading(false); // Ensure loading state is cleared in all cases
      }
    };

    if (problemId) {
      fetchSolutions();
    }
  }, [problemId, addAlert, videoUrl]);

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
              <p className='complexity-title'>Complexity Analysis</p>
              <p className='complexity'>
                Time Complexity: <InlineMath>{solution.timeComplexity}</InlineMath>
              </p>
              <p className='complexity'>
                Space Complexity: <InlineMath>{solution.spaceComplexity}</InlineMath>
              </p>
              <hr className="solution-divider" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Solution;