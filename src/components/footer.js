import React from "react";
import "../styles/footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer">
      <hr className="footer-hr" />
      <p>Copyright © CompCode {currentYear} All rights reserved.</p>
      <p>
        support:{" "}
        <a className="footer-link" href="mailto: comp-code@outlook.com">
          comp-code@outlook.com
        </a>
      </p>
      <div className="footer-links">
        <Link className="footer-link" to="/terms">
          Terms and Conditions
        </Link>
        <Link className="footer-link" to="/policy">
          Privacy Policy
        </Link>
      </div>
      <div className="footer-external-links">
        <a
          className="footer-external-link"
          href="https://github.com/ahmad-masud/LeetCode-Solutions"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-github"></i>
        </a>
        <a
          className="footer-external-link"
          href="https://www.youtube.com/@comp-code"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa-brands fa-youtube"></i>
        </a>
      </div>
    </div>
  );
};

export default Footer;
