import React, { useEffect, useState } from 'react';
import '../styles/navbar.css';
import { auth, provider } from '../config/firebase-config';
import { signInWithPopup, signOut } from 'firebase/auth';
import Google from '../content/images/google.webp'
import { Link } from 'react-router-dom';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { useAlerts } from '../context/alertscontext';
import Confirm from '../components/confirm';

const Navbar = ({ user, onUserChange, onSettingsOpen, onSubmissionOpen }) => {
  const [narrow, setNarrow] = useState(false);
  const { addAlert } = useAlerts();
  const [displayConfirm, setDisplayConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) {
        setNarrow(true);
      } else {
        setNarrow(false);
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
        addAlert("User signed in successfully.", "success");
        onUserChange(result.user);
      })
      .catch((error) => {
        console.error('Error during sign in:', error);
        addAlert("Error during sign in.", "error");
      });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        addAlert("User signed out successfully.", "success");
        onUserChange(null);
      })
      .catch((error) => {
        addAlert("Error during sign out.", "error");
        console.error('Error during sign out:', error);
      });
  };

  const confirmAction = () => {
    handleLogin();
    setDisplayConfirm(false);
  };

  const showConfirm = (message) => {
    setConfirmMessage(message);
    setDisplayConfirm(true);
  };

  return (
    <div>
      {displayConfirm && (
        <Confirm 
          onClose={() => setDisplayConfirm(false)} 
          message={confirmMessage} 
          onConfirm={confirmAction} 
        />
      )}
      <div className='navbar'>
        <div className='navbar-container'>
          <div className='left'>
            <i className="fa-solid fa-meteor"></i>
            {!narrow ? (
              <div className='nav-links'>
                <Link className='nav-link' to='/'>Home</Link>
                <Link className='nav-link' to='/companies'>Companies</Link>
                <Link className='nav-link' to='/roadmap'>Roadmap</Link>
                <Link className='nav-link' to='/lessons'>Lessons</Link>
                <button className='nav-link' onClick={() => onSubmissionOpen()}>Report</button>
              </div>
            ) : (
              <div className='nav-links'>
                <Link className='nav-link' to='/'><i className="fa-solid fa-house"></i></Link>
                <Link className='nav-link' to='/companies'><i className="fa-solid fa-building"></i></Link>
                <Link className='nav-link' to='/roadmap'><i className="fa-solid fa-share-nodes"></i></Link>
                <Link className='nav-link' to='/lessons'><i className="fa-solid fa-brain"></i></Link>
                <button className='nav-link' onClick={() => onSubmissionOpen()}><i className="fa-solid fa-flag"></i></button>
              </div>
            )}
          </div>
          <div className='right'>
            <Link to='/premium' className='premium-button'><i className="fa-solid fa-crown"></i> {!narrow && "Premium"}</Link>
            {user ? (
              <div className='login-right'>
                <Menu menuButton={<MenuButton className="user-button"><img src={user.photoURL} alt='User' className='user-avatar' /></MenuButton>}>
                  <MenuItem onClick={onSettingsOpen}><i className="fa-solid fa-gear"></i> Settings</MenuItem>
                  <hr className="menu-divider"/>
                  <MenuItem onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</MenuItem>
                </Menu>
              </div>
            ) : (
              <button className='login-button' onClick={() => showConfirm("By confirming you agree to our Terms and Conditions")}>
                <img src={Google} alt="google"/>{!narrow && "Continue with Google"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;