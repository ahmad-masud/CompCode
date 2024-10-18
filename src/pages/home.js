import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import ReleaseNotes from '../components/release';

const Home = () => {
    return (
        <div className='home'>
            <div className='hero'>
                <div className='hero-text'>
                    <p className='hero-title'><span><i className="fa-solid fa-meteor"></i> CompCode:</span> The best resource for doing LeetCode Problems</p>
                    <p className='hero-overview'>Prepare for your company's technical interview through solving frequently asked LeetCode problems.</p>
                    <Link to="/companies" className='hero-link'>Get Started</Link>
                </div>
            </div>
            <ReleaseNotes />
        </div>
    );
};

export default Home;