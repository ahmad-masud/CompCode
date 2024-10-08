import React, { useEffect, useState } from 'react';
import '../styles/navbar.css';
import { auth, provider } from '../config/firebase-config';
import { signInWithPopup, signOut } from 'firebase/auth';
import Google from '../content/images/google.webp'
import { Link } from 'react-router-dom';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onUserChange, onAccountOpen, onSettingsOpen }) => {
  const [narrow, setNarrow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
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
          {!narrow ? (
            <div>
              <Link className='nav-link' to='/CompCode/'>Home</Link>
              <Link className='nav-link' to='/CompCode/companies'>Companies</Link>
              <Link className='nav-link' to='/CompCode/datastructures'>Data Structures</Link>
              <Link className='nav-link' to='/CompCode/algorithms'>Algorithms</Link>
              <Link className='nav-link' to='/CompCode/submission'>Report</Link>
            </div>
          ) : (
            <Menu menuButton={<MenuButton className="user-button"><i className="fa-solid fa-bars"></i></MenuButton>}>
              <MenuItem onClick={() => navigate('/CompCode/')}><i className="fa-solid fa-house"></i> Home</MenuItem>
              <MenuItem onClick={() => navigate('/CompCode/companies')}><i className="fa-solid fa-building"></i> Companies</MenuItem>
              <MenuItem onClick={() => navigate('/CompCode/datastructures')}><i className="fa-solid fa-database"></i> Data Structures</MenuItem>
              <MenuItem onClick={() => navigate('/CompCode/algorithms')}><i className="fa-solid fa-diagram-project"></i> Algorithms</MenuItem>
              <MenuItem onClick={() => navigate('/CompCode/submission')}><i className="fa-solid fa-flag"></i> Report</MenuItem>
            </Menu>
          )}
        </div>
        <div className='right'>
          {user ? (
              <Menu menuButton={<MenuButton className="user-button"><img src={user.photoURL} alt='User' className='user-avatar' /></MenuButton>}>
                <MenuItem onClick={onAccountOpen}><i className="fa-solid fa-user"></i> Account</MenuItem>
                <MenuItem onClick={onSettingsOpen}><i className="fa-solid fa-gear"></i> Settings</MenuItem>
                <hr className="menu-divider"/>
                <MenuItem onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</MenuItem>
              </Menu>
          ) : (
            <button className='login-button' onClick={handleLogin}>
              <img src={Google} alt="google"/>{!narrow && "Continue with Google"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;