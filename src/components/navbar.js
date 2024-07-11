import React, { useState, useEffect } from 'react';
import '../styles/navbar.css';
import { auth, provider } from '../config/firebase-config';
import { signInWithPopup, signOut } from 'firebase/auth';

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
      </div>
      <div className='right'>
        <button className='color-button' onClick={handleThemeChange}>
          {theme === 'auto' ? <i className="fa-solid fa-circle-half-stroke"></i> : 
           theme === 'dark' ? <i className="fa-solid fa-moon"></i> : 
           <i className="fa-solid fa-sun"></i>}
        </button>
        {user ? (
          <div className='user-profile'>
            <img src={user.photoURL} alt='User' className='user-avatar' />
          </div>
        ) : (
          <button className='login-button' onClick={handleLogin}>
            <i className="fa-solid fa-right-to-bracket"></i>
          </button>
        )}
        {user && (
          <button className='login-button' onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;