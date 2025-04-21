import React, { useState } from "react";
import "../styles/report.css";
import useReport from "../hooks/useReport";

const Report = ({ onClose, onOpen, open }) => {
  const [problemNumber, setProblemNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const submitReport = useReport();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitReport(problemNumber, companyName);
    setProblemNumber("");
    setCompanyName("");
  };

  if (!open) {
    return (
      <div className="report-button">
        <button onClick={() => onOpen()}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="submission-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="submission-content">
        <div className="submission-header">
          <p className="submission-title">Report a Problem</p>
          <button className="submission-close-button" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        <hr className="submission-divider" />
        <div className="submission-container">
          <form className="submission-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>LeetCode Problem Number</label>
              <input
                type="number"
                value={problemNumber}
                onChange={(e) => setProblemNumber(e.target.value)}
                placeholder="Enter the LeetCode problem number"
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter the company name"
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>

          <p className="footer-text">
            Thank you for your contribution! Your submission helps others
            practice targeted questions for specific companies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
