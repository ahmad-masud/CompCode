import React, { useState, useEffect } from 'react';
import '../styles/release.css';

const ReleaseNotes = () => {
  const [releases, setReleases] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    import('../content/release.json')
      .then((data) => setReleases(data.default))
      .catch((error) => console.error('Error loading JSON data: ', error));
  }, [releases]);

  const displayedReleases = showAll ? releases : releases.slice(0, 4);

  return (
    <div className="release-notes">
      <h2>Release Notes</h2>
      <ul>
        {displayedReleases.map((release, index) => {
          const [year, month, day] = release.date.split('-');
          const releaseDate = new Date(year, month - 1, day);
          return (
            <li key={index}>
              <span className="release-date">
                {releaseDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              : {release.comment}
            </li>
          );
        })}
      </ul>
      {releases.length > 4 && (
        <button className="show-more" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default ReleaseNotes;
