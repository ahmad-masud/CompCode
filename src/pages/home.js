import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import ReleaseNotes from '../components/release';

const Home = () => {
    return (
        <div className='home'>
            <div className='hero'>
                <div className='hero-text'>
                    <p className='hero-title'>CompCode</p>
                    <p className='hero-overview'>Prepare for your company's technical interview through solving frequently asked LeetCode problems.</p>
                    <Link to="/CompCode/companies" className='hero-link'>Start Leeting</Link>
                </div>
                <div className='hero-logo'>
                    <i className="fa-solid fa-code"></i>
                </div>
            </div>
            <ReleaseNotes />
        </div>
    );
};

export default Home;