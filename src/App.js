import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import DataStructures from './pages/datastructures';
import Algorithms from './pages/algorithms';
import NotFound from './pages/notfound';
import ProblemSubmissionForm from './pages/problemsubmissionform';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import './styles/app.css';
import Account from './components/account';
import Settings from './components/settings';

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [displayAccount, setDisplayAccount] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(false);

  useEffect(() => {
    if (theme === 'auto') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.querySelector(":root").className = isDarkMode ? 'dark' : 'light';
    } else {
      document.querySelector(":root").className = theme;
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleUserChange = (newUser) => {
    setUser(newUser);
  }

  const handleAccountClose = () => {
    setDisplayAccount(false);
  }

  const handleAccountOpen = () => {
    setDisplayAccount(true);
  }

  const handleSettingsClose = () => {
    setDisplaySettings(false);
  }

  const handleSettingsOpen = () => {
    setDisplaySettings(true);
  }

  return (
    <div className='app'>
      {displayAccount && <Account user={user} onClose={handleAccountClose} />}
      {displaySettings && <Settings user={user} onClose={handleSettingsClose} theme={theme} onThemeChange={handleThemeChange} />}
      <Router>
        <Navbar user={user} onUserChange={handleUserChange} theme={theme} onThemeChange={handleThemeChange} onAccountOpen={handleAccountOpen} onSettingsOpen={handleSettingsOpen} />
        <Routes>
          <Route path='/CompCode/' element={<Home theme={theme} />} />
          <Route path='/CompCode/companies' element={<Companies user={user} />} />
          <Route path='/CompCode/datastructures' element={<DataStructures user={user} />} />
          <Route path='/CompCode/algorithms' element={<Algorithms user={user} />} />
          <Route path='/CompCode/submission' element={<ProblemSubmissionForm user={user} onUserChange={handleUserChange} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
