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
import lessons from './content/lessons.json';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './config/firebase-config';

const stripePromise = loadStripe(String(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY));

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [displaySettings, setDisplaySettings] = useState(false);
  const [displaySubmission, setDisplaySubmission] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: '',
    canceled: false,
    customerId: '',
    subscriptionEnd: null,
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.premiumInfo) {
              setPremiumInfo({
                premium: userData.premiumInfo.premium || false,  // Set a default value if undefined
                subscriptionId: userData.premiumInfo.subscriptionId || "",  // Set default empty string if undefined
                canceled: userData.premiumInfo.canceled || false,  // Set default to false if undefined
                customerId: userData.premiumInfo.stripeCustomerId || "",  // Set default empty string if undefined
                subscriptionEnd: userData.premiumInfo.subscriptionEnd || null,  // Set default to null if undefined
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      setPremiumInfo({
        premium: false,
        subscriptionId: '',
        canceled: false,
        customerId: '',
        subscriptionEnd: null,
      });
    }
  }, [user]);

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
        {displaySettings && <Settings user={user} onClose={() => setDisplaySettings(false)} theme={theme} onThemeChange={(newTheme) => setTheme(newTheme)} premiumInfo={premiumInfo} />}
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
              <Route path='/companies' element={<Companies user={user} premiumInfo={premiumInfo} />} />
              <Route path='/roadmap' element={<Roadmap user={user} />} />
              <Route path='/premium' element={<Premium user={user} premiumInfo={premiumInfo} />} />
              {lessons.map((lesson, index) => (
                <Route key={`${lesson.id}-${index}`} path={`/lesson/${lesson.title.replaceAll(' ', '-').toLowerCase()}`} element={<Lesson data={lesson} />} />
              ))}
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
