import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import ReleaseNotes from '../components/release';
import LeetCode1 from '../content/images/leetcode.webp';
import LeetCode2 from '../content/images/leetcode2.webp';
import { useEffect } from 'react';

const Home = ({ theme }) => {
    const [LeetCode, setLeetCode] = React.useState(LeetCode2);

    useEffect(() => {
        if (theme === 'auto') {
          const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDarkMode) {
            setLeetCode(LeetCode1);
          }
        } else {
            if (theme === 'dark') {
                setLeetCode(LeetCode1);
            } else {
                setLeetCode(LeetCode2);
            }
        }
    }, [theme]);

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
            <ReleaseNotes />
        </div>
    );
};

export default Home;