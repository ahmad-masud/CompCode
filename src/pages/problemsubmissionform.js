import React, { useState } from 'react';
import { firestore } from '../config/firebase-config'; // Use your firebase-config
import { doc, setDoc } from 'firebase/firestore'; // Firebase Firestore functions
import '../styles/problemsubmissionform.css'; // Import a CSS file for styling

const ProblemSubmissionForm = ({ user }) => {
  const [problemNumber, setProblemNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to submit.");
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

      alert("Submission successful!");
      setProblemNumber(''); // Clear form fields
      setCompanyName('');
    } catch (error) {
      console.error("Error submitting data: ", error);
    }
  };

  return (
    <div className="submission">
        <div className="submission-container">
        <h1>Submit a LeetCode Problem for Company-specific Practice</h1>
        <p>Welcome to our problem submission page! If you encountered a specific problem found on LeetCode in your last technical interview please submit it here. This page allows you to contribute LeetCode problems for specific companies. By submitting the problem number and company, you help build a curated list for others to practice. Please make sure you're logged in with Google to submit.</p>
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
  );
};

export default ProblemSubmissionForm;