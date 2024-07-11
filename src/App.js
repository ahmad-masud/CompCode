import React, { useState } from 'react';
import Problems from './components/problems';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Companies from './pages/companies';
import './styles/app.css';

const App = () => {
  const [openCompany, setOpenCompany] = useState("");
  const [user, setUser] = useState(null);

  const handleClick = (company) => {
    setOpenCompany(company);
  };

  const handleClose = () => {
    setOpenCompany("");
  };

  const handleUserChange = (newUser) => {
    setUser(newUser);
  }

  return (
    <div className='app'>
      <Navbar user={user} onUserChange={handleUserChange} />
      <Companies handleClick={handleClick} />
      {openCompany && <Problems company={openCompany} onClose={handleClose} user={user} />}
      <Footer />
    </div>
  );
};

export default App;
