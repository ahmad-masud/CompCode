import React from 'react';
import '../styles/video.css';

const Video = ({ link, onClose, isOpen }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="video-overlay">
            <div className="overlay-backdrop" onClick={onClose}></div>
            <div className="video-content">
                <button className="close-button" onClick={onClose}>
                    <i className="bi bi-x"></i>
                </button>
                <iframe
                    className="video-frame"
                    src={`https://www.youtube.com/embed/${link}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default Video;