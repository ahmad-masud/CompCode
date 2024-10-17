import React, { useState } from 'react';
import { firestore } from '../config/firebase-config'; // Use your firebase-config
import { doc, setDoc } from 'firebase/firestore'; // Firebase Firestore functions
import '../styles/problemsubmissionform.css'; // Import a CSS file for styling
import { useAlerts } from '../context/alertscontext';

const ProblemSubmissionForm = ({ user, onClose }) => {
  const [problemNumber, setProblemNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { addAlert } = useAlerts();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      addAlert("You must be logged in to submit.", "warning");
      return;
    }

    const email = user.email; // Get user email from props

    try {
      // Define the document reference for storing the data
      const submissionRef = doc(firestore, 'submissions', `${user.uid}-${problemNumber}`);

      // Set the document with user data in Firestore
      await setDoc(submissionRef, {
        problemNumber,
        companyName,
        email,
        submittedAt: new Date(), // Store the timestamp
      });

      addAlert("Problem submitted successfully!", "success");
      setProblemNumber(''); // Clear form fields
      setCompanyName('');
    } catch (error) {
      console.error("Error submitting data: ", error);
      addAlert("Error submitting data.", "error");
    }
  };

  return (
    <div className="submission-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="submission-content">
        <button className="close-button" onClick={onClose}><i className="bi bi-x"></i></button>
        <div className="submission-container">
          <h1>Submit a LeetCode Problem for Company-specific Practice</h1>
          <p>If you encountered a specific problem found on LeetCode in your last technical interview please submit it here.</p>
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

              <button type="submit" className="submit-button">Submit Problem</button>
          </form>

          <p className="footer-text">Thank you for your contribution! Your submission helps others practice targeted questions for specific companies.</p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSubmissionForm;