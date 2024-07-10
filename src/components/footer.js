import React from 'react';
import '../styles/footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className='footer'>
            <p>Copyright © FaangCode {currentYear} All rights reserved.</p>
        </div>
    );
};

export default Footer;