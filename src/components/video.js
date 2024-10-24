import React, { useEffect, useState } from 'react';
import '../styles/video.css'; // Import a CSS file for styling
import { useAlerts } from '../context/alertscontext'; // Assuming you have an alerts context

const Video = ({ link, onClose }) => {
    const { addAlert } = useAlerts();
    const [found, setFound] = useState(false);

    useEffect(() => {
        if (!link) {
            addAlert('No video found.', 'warning');
            return;
        }
        setFound(true);
    }, [link, addAlert]);

    if (!found) {
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