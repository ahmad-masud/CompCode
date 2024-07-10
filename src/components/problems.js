import React, { useState, useEffect } from 'react';
import '../styles/problems.css'; // Import CSS file for styles
import { firestore } from '../config/firebase-config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const Problems = ({ company, onClose, user }) => {
  const [problems, setProblems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'Difficulty', direction: 'ascending' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load problems data from JSON file
        const data = await import(`../content/problems/${company}.json`);
        const sortedData = data.default.sort((a, b) => {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.Difficulty] - difficultyOrder[b.Difficulty];
        });
        setProblems(sortedData);

        // If user is logged in, fetch completion status from Firestore
        if (user) {
          await Promise.all(
            sortedData.map(async (problem) => {
              const docRef = doc(firestore, 'users', user.uid, 'problems', problem.ID.toString());
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                problem.status = docSnap.data().status;
              } else {
                problem.status = false;
              }
            })
          );
          setProblems([...sortedData]); // Update state with status
        }
      } catch (error) {
        console.error('Error loading or updating data:', error);
      }
    };

    fetchData();
  }, [company, user]);

  const sortProblems = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedProblems = [...problems].sort((a, b) => {
      if (key === 'Difficulty') {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return direction === 'ascending'
          ? difficultyOrder[a[key]] - difficultyOrder[b[key]]
          : difficultyOrder[b[key]] - difficultyOrder[a[key]];
      }

      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setProblems(sortedProblems);
  };

  const handleCheckboxChange = async (index, checked) => {
    try {
      const updatedProblems = [...problems];
      updatedProblems[index].status = checked;
      setProblems(updatedProblems);
  
      if (user) {
        const problemId = updatedProblems[index].ID.toString(); // Ensure problem ID is obtained from updatedProblems
        const userId = user.uid;
        const docRef = doc(firestore, 'users', userId, 'problems', problemId);
        
        console.log('Updating document:', docRef.path); // Log document path for debugging
  
        await updateDoc(docRef, {
          status: checked,
        });
        
        console.log('Document updated successfully!');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };   

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fa-solid fa-sort"></i>;
    }
    if (sortConfig.direction === 'ascending') {
      return <i className="fa-solid fa-sort-down"></i>;
    }
    return <i className="fa-solid fa-sort-up"></i>;
  };

  return (
    <div className="problems-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="overlay-content">
        <button className="close-button" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h2>LeetCode Problems for {company[0].toUpperCase() + company.slice(1)}</h2>
        <div className="problem-table">
          <div className="table-header">
            <div>Status</div>
            <div>ID <button className="sort-button" onClick={() => sortProblems('ID')}>{getSortIcon('ID')}</button></div>
            <div>Title <button className="sort-button" onClick={() => sortProblems('Title')}>{getSortIcon('Title')}</button></div>
            <div>Acceptance <button className="sort-button" onClick={() => sortProblems('Acceptance')}>{getSortIcon('Acceptance')}</button></div>
            <div>Difficulty <button className="sort-button" onClick={() => sortProblems('Difficulty')}>{getSortIcon('Difficulty')}</button></div>
            <div>Frequency <button className="sort-button" onClick={() => sortProblems('Frequency')}>{getSortIcon('Frequency')}</button></div>
          </div>
          {problems.map((problem, index) => (
            <div className="table-row" key={index}>
              <div><input type="checkbox" checked={problem.status || false} onChange={(e) => handleCheckboxChange(index, e.target.checked)} /></div>
              <div>{problem.ID}</div>
              <div>
                <a href={problem['Leetcode Question Link']} target="_blank" rel="noopener noreferrer">
                  {problem.Title} <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
              <div>{problem.Acceptance}</div>
              <div className={problem.Difficulty.toLowerCase()}>{problem.Difficulty}</div>
              <div>{Math.round(problem.Frequency * 100) / 100}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Problems;