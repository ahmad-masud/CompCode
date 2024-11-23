import React, { useState } from "react";
import { firestore } from "../config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import "../styles/report.css";
import { useAlerts } from "../context/alertscontext";
import { useUser } from "../context/usercontext";

const Report = ({ onClose, onOpen, open }) => {
  const [problemNumber, setProblemNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const { addAlert } = useAlerts();
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      addAlert("You must be logged in to submit.", "warning");
      return;
    }

    const email = user.email;

    try {
      const submissionRef = doc(
        firestore,
        "submissions",
        `${user.uid}-${problemNumber}`
      );

      await setDoc(submissionRef, {
        problemNumber,
        companyName,
        email,
        submittedAt: new Date(),
      });

      addAlert("Problem submitted successfully!", "success");
      setProblemNumber("");
      setCompanyName("");
    } catch (error) {
      console.error("Error submitting data: ", error);
      addAlert("Error submitting data.", "error");
    }
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
