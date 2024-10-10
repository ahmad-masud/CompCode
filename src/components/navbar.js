import React, { useEffect, useState } from 'react';
import '../styles/navbar.css';
import { auth, provider } from '../config/firebase-config';
import { signInWithPopup, signOut } from 'firebase/auth';
import Google from '../content/images/google.webp'
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onUserChange, theme, onThemeChange }) => {
  const [showIcons, setShowIcons] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) {
        setShowIcons(true);
      } else {
        setShowIcons(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className='navbar'>
      <div className='navbar-container'>
        <div className='left'>
          <i className="fa-solid fa-meteor"></i>
          <Link className='nav-link' to='/CompCode/'>{showIcons ? <i className="fa-solid fa-house"></i> : "Home"}</Link>
          <Link className='nav-link' to='/CompCode/companies'>{showIcons ? <i className="fa-solid fa-building"></i> : "Companies"}</Link>
          <Link className='nav-link' to='/CompCode/datastructures'>{showIcons ? <i className="fa-solid fa-database"></i> : "Data Structures"}</Link>
          <Link className='nav-link' to='/CompCode/algorithms'>{showIcons ? <i className="fa-solid fa-diagram-project"></i> : "Algorithms"}</Link>
          <Link className='nav-link' to='/CompCode/misc'>{showIcons ? <i className="fa-solid fa-shuffle"></i> : "Misc"}</Link>
          <Link className='nav-link' to='/CompCode/submission'>{showIcons ? <i className="fa-solid fa-flag"></i> : "Report"}</Link>
        </div>
        <div className='right'>
          <Tooltip title="Color Mode">
            <button className='color-button' onClick={onThemeChange}>
              {theme === 'auto' ? <i className="bi bi-circle-half"></i> : 
              theme === 'dark' ? <i className="bi bi-moon-fill"></i> : 
              <i className="bi bi-brightness-high-fill"></i>}
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
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;