import React, { useState } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import Concepts from './pages/concepts';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import './styles/app.css';

const App = () => {
  const [user, setUser] = useState(null);

  const handleUserChange = (newUser) => {
    setUser(newUser);
  }

  return (
    <div className='app'>
      <Router>
        <Navbar user={user} onUserChange={handleUserChange} />
        <Routes>
          <Route path='/CompCode/' element={<Home />} />
          <Route path='/CompCode/companies' element={<Companies user={user} />} />
          <Route path='/CompCode/concepts' element={<Concepts user={user} />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
