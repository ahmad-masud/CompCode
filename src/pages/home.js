import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import ReleaseNotes from '../components/release';
import tips from '../content/tips';

const Home = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  const tipIndex = dayOfYear % tips.length;
  const tip = tips[tipIndex];

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-text">
          <p className="hero-title">
            <span>
              <i className="fa-solid fa-meteor"></i> CompCode:
            </span>{' '}
            The best resource for doing LeetCode Problems
          </p>
          <p className="hero-overview">
            Prepare for your company's technical interview through solving
            frequently asked LeetCode problems.
          </p>
          <Link to="/companies" className="hero-link">
            Get Started
          </Link>
          <p className="tech-tip">Today's tech tip: {tip}</p>
        </div>
      </div>
      <ReleaseNotes />
    </div>
  );
};

export default Home;
