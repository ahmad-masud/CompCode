import React, { useState, useEffect } from 'react';
import '../styles/navbar.css';
import { auth, provider } from '../config/firebase-config';
import { signInWithPopup, signOut } from 'firebase/auth';
import Google from '../content/images/google.webp'
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onUserChange }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'auto');

  useEffect(() => {
    if (theme === 'auto') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.querySelector(":root").className = isDarkMode ? 'dark' : 'light';
    } else {
      document.querySelector(":root").className = theme;
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        onUserChange(user);
      } else {
        onUserChange(null);
      }
    });

    return () => unsubscribe();
  }, [onUserChange]);

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('User signed in');
        onUserChange(result.user);
      })
      .catch((error) => {
        console.error('Error during sign in:', error);
      });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        onUserChange(null);
      })
      .catch((error) => {
        console.error('Error during sign out:', error);
      });
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto';
    setTheme(newTheme);
  };

  return (
    <div className='navbar'>
      <div className='left'>
        <p>CompCode</p>
        <Link className='nav-link' to='/CompCode/'>Home</Link>
        <Link className='nav-link' to='/CompCode/companies'>Companies</Link>
        <Link className='nav-link' to='/CompCode/concepts'>Concepts</Link>
      </div>
      <div className='right'>
        <Tooltip title="Color Mode">
          <button className='color-button' onClick={handleThemeChange}>
            {theme === 'auto' ? <i className="fa-solid fa-circle-half-stroke"></i> : 
            theme === 'dark' ? <i className="fa-solid fa-moon"></i> : 
            <i className="fa-solid fa-sun"></i>}
          </button>
        </Tooltip>
        {user ? (
          <div className='user-profile'>
            <img src={user.photoURL} alt='User' className='user-avatar' />
          </div>
        ) : (
          <Tooltip title="Google Login">
            <button className='login-button' onClick={handleLogin}>
              <img src={Google} alt="google"/>
            </button>
          </Tooltip>
        )}
        {user && (
          <Tooltip title="Logout">
            <button className='login-button' onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Navbar;