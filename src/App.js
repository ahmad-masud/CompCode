import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import NotFound from './pages/notfound';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import './styles/app.css';
import Settings from './components/settings';
import Submission from './components/submission';
import Premium from './pages/premium';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Alerts from './components/alerts';
import { AlertsProvider } from './context/alertscontext';
import Lesson from './pages/lesson';
import Policy from './pages/policy';
import Terms from './pages/terms';
import Roadmap from './pages/roadmap';

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [displaySettings, setDisplaySettings] = useState(false);
  const [displaySubmission, setDisplaySubmission] = useState(false);
  const stripePromise = loadStripe(String(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY));

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
      <AlertsProvider>
        <Alerts />
        {displaySettings && <Settings user={user} onClose={() => setDisplaySettings(false)} theme={theme} onThemeChange={(newTheme) => setTheme(newTheme)} />}
        {displaySubmission && <Submission user={user} onClose={() => setDisplaySubmission(false)} />}
        <Router>
          <Navbar 
            user={user} 
            onUserChange={(newUser) => setUser(newUser)} 
            theme={theme} 
            onThemeChange={(newTheme) => setTheme(newTheme)} 
            onSettingsOpen={() => setDisplaySettings(true)}
            onSubmissionOpen={() => setDisplaySubmission(true)} 
          />
          <Elements stripe={stripePromise}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/companies' element={<Companies user={user} />} />
              <Route path='/roadmap' element={<Roadmap user={user} />} />
              <Route path='/premium' element={<Premium user={user} />} />
              <Route path='/lesson/:lessonId' element={<Lesson user={user} />} />
              <Route path='/policy' element={<Policy />} />
              <Route path='/terms' element={<Terms />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Elements>
          <Footer />
        </Router>
      </AlertsProvider>
    </div>
  );
};

export default App;
