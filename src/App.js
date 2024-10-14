import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import DataStructures from './pages/datastructures';
import Algorithms from './pages/algorithms';
import NotFound from './pages/notfound';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import './styles/app.css';
import Account from './components/account';
import Settings from './components/settings';
import Submission from './components/submission';

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [displayAccount, setDisplayAccount] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [displaySubmission, setDisplaySubmission] = useState(false);

  useEffect(() => {
    if (theme === 'auto') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.querySelector(":root").className = isDarkMode ? 'dark' : 'light';
    } else {
      document.querySelector(":root").className = theme;
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className='app'>
      {displayAccount && <Account user={user} onClose={() => setDisplayAccount(false)} />}
      {displaySettings && <Settings user={user} onClose={() => setDisplaySettings(false)} theme={theme} onThemeChange={(newTheme) => setTheme(newTheme)} />}
      {displaySubmission && <Submission user={user} onClose={() => setDisplaySubmission(false)} />}
      <Router>
        <Navbar 
          user={user} 
          onUserChange={(newUser) => setUser(newUser)} 
          theme={theme} 
          onThemeChange={(newTheme) => setTheme(newTheme)} 
          onAccountOpen={() => setDisplayAccount(true)} 
          onSettingsOpen={() => setDisplaySettings(true)}
          onSubmissionOpen={() => setDisplaySubmission(true)} 
        />
        <Routes>
          <Route path='/CompCode/' element={<Home theme={theme} />} />
          <Route path='/CompCode/companies' element={<Companies user={user} />} />
          <Route path='/CompCode/datastructures' element={<DataStructures user={user} />} />
          <Route path='/CompCode/algorithms' element={<Algorithms user={user} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
