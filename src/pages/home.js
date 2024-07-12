import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className='home'>
            <div className='hero'>
                <div className='hero-text'>
                    <p className='hero-title'>CompCode</p>
                    <p className='hero-overview'>Prepare for your company's coding interview through solving frequently asked LeetCode problems.</p>
                    <Link to="/CompCode/problems" className='hero-link'>Start Leeting</Link>
                </div>
                <div className='hero-logo'>
                    <i className="fa-solid fa-code"></i>
                </div>
            </div>
        </div>
    );
};

export default Home;