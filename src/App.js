import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import DataStructures from './pages/datastructures';
import Algorithms from './pages/algorithms';
import NotFound from './pages/notfound';
import Misc from './pages/misc';
import ProblemSubmissionForm from './pages/problemsubmissionform';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import './styles/app.css';

const App = () => {
  const [user, setUser] = useState(null);
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

  const handleThemeChange = () => {
    const newTheme = theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto';
    setTheme(newTheme);
  };

  const handleUserChange = (newUser) => {
    setUser(newUser);
  }

  return (
    <div className='app'>
      <Router>
        <Navbar user={user} onUserChange={handleUserChange} theme={theme} onThemeChange={handleThemeChange} />
        <Routes>
          <Route path='/CompCode/' element={<Home theme={theme} />} />
          <Route path='/CompCode/companies' element={<Companies user={user} />} />
          <Route path='/CompCode/datastructures' element={<DataStructures user={user} />} />
          <Route path='/CompCode/algorithms' element={<Algorithms user={user} />} />
          <Route path='/CompCode/misc' element={<Misc user={user} />} />
          <Route path='/CompCode/submission' element={<ProblemSubmissionForm user={user} onUserChange={handleUserChange} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
