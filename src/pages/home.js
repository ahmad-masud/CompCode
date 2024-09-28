import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import ReleaseNotes from '../components/release';
import LeetCode from '../content/images/leetcode.webp';

const Home = () => {
    return (
        <div className='home'>
            <div className='hero'>
                <div className='hero-text'>
                    <p className='hero-title'><span><i className="fa-solid fa-meteor"></i> CompCode:</span> The best resource for doing LeetCode Problems</p>
                    <p className='hero-overview'>Prepare for your company's technical interview through solving frequently asked LeetCode problems.</p>
                    <Link to="/CompCode/companies" className='hero-link'>Get Started</Link>
                    <p className='hero-credits'><span>A resource for</span><a href='https://leetcode.com/' target="_blank" rel="noopener noreferrer"><img src={LeetCode} alt='LeetCode'/></a></p>
                </div>
            </div>
            <div className='highlights'>
                <div className='highlight'>
                    <i className="image fa-solid fa-earth-americas"></i>
                    <div className='text'>
                        <p className='tagline'>Crack the code for top companies like Google, Amazon, Microsoft, and more!</p>
                        <p className='description'>Focus on the coding problems asked by specific companies. Find frequently asked problems from leading tech giants help you sharpen your skills for real-world interview challenges.</p>
                    </div>
                </div>
                <div className='highlight'>
                    <i className="image fa-solid fa-diagram-project"></i>
                    <div className='text'>
                        <p className='tagline'>Conquer essential algorithms and data structures for coding interviews!</p>
                        <p className='description'>With powerful progress tracking, you can easily monitor your journey. From solved problems to performance analytics, stay on top of your preparation.</p>
                    </div>
                </div>
                <div className='highlight'>
                    <i className="image fa-solid fa-list-check"></i>
                    <div className='text'>
                        <p className='tagline'>See your progress, boost your confidence!</p>
                        <p className='description'>CompCode offers a comprehensive collection of problems that focus on the most commonly tested algorithms and data structures in interviews. Whether it's sorting algorithms, dynamic programming, graph traversal, or linked lists, we’ve got you covered.</p>
                    </div>
                </div>
            </div>
            <ReleaseNotes />
        </div>
    );
};

export default Home;