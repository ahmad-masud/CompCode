import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/notfound.css';

const NotFound = () => {
  return (
    <div className='notfound'>
      <p>404</p>
      <p>Page Not Found</p>
      <Link to='/CompCode/' className='notfound-link'>Go Home</Link>
    </div>
  );
};

export default NotFound;