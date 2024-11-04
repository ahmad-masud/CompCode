import React from 'react';
import '../styles/video.css';

const Video = ({ url, onClose }) => {
  return (
    <div className="video-overlay">
      <div className='overlay-backdrop' onClick={onClose}></div>
      <div className="video-content">
        <button className="close-button" onClick={onClose}>
          <i className="bi bi-x"></i>
        </button>
        <iframe
            src={`https://www.youtube.com/embed/${url}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className='video-iframe'
        ></iframe>
      </div>
    </div>
  );
};

export default Video;