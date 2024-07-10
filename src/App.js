import React, { useState } from 'react';
import Graph from './components/graph';
import Problems from './components/problems';
import Navbar from './components/navbar';
import Footer from './components/footer';
import './styles/app.css';

const App = () => {
  const [openCompany, setOpenCompany] = useState("");
  const [user, setUser] = useState(null);

  const handleNodeClick = (company) => {
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
      <Graph onNodeClick={handleNodeClick} />
      {openCompany && <Problems company={openCompany} onClose={handleClose} user={user} />}
      <Footer />
    </div>
  );
};

export default App;
