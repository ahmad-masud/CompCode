import React, { useState } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import DataStructures from './pages/datastructures';
import Algorithms from './pages/algorithms';
import NotFound from './pages/notfound';
import Misc from './pages/misc';
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
          <Route path='/CompCode/datastructures' element={<DataStructures user={user} />} />
          <Route path='/CompCode/algorithms' element={<Algorithms user={user} />} />
          <Route path='/CompCode/misc' element={<Misc user={user} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
