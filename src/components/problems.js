import React, { useState, useEffect } from 'react';
import '../styles/problems.css'; // Import CSS file for styles
import { firestore } from '../config/firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const Problems = ({ company, user, onClose, page }) => {
  const [problems, setProblems] = useState([]);
  const [completedProblems, setCompletedProblems] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'Difficulty', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    import(`../content/${page}/${company}.json`)
      .then((data) => {
        const sortedData = data.default.sort((a, b) => {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.Difficulty] - difficultyOrder[b.Difficulty];
        });
        setProblems(sortedData);
      })
      .catch((error) => {
        console.error("Error loading JSON data: ", error);
      });
  }, [page, company]);

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCompletedProblems(userData.completedProblems || {});
        } else {
          // Create a new document if it doesn't exist
          setDoc(userRef, { completedProblems: {} });
        }
      }).catch((error) => {
        console.error("Error fetching user data: ", error);
      });
    } else {
      const completedProblemsFromLocalStorage = JSON.parse(localStorage.getItem('completedProblems'));
      setCompletedProblems(completedProblemsFromLocalStorage || {});
    }
  }, [user]);

  const handleCheckboxChange = async (problemId) => {
    const newCompletedProblems = { ...completedProblems, [problemId]: !completedProblems[problemId] };
    setCompletedProblems(newCompletedProblems);

    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { completedProblems: newCompletedProblems }).catch(async (error) => {
        if (error.code === 'not-found') {
          await setDoc(userRef, { completedProblems: newCompletedProblems });
        } else {
          console.error("Error updating user data: ", error);
        }
      });
    }

    localStorage.setItem('completedProblems', JSON.stringify(newCompletedProblems));
  };

  const sortProblems = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedProblems = [...problems].sort((a, b) => {
      if (key === 'ID') {
        return direction === 'ascending'
          ? a[key] - b[key]
          : b[key] - a[key];
      } else if (key === 'Difficulty') {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return direction === 'ascending'
          ? difficultyOrder[a[key]] - difficultyOrder[b[key]]
          : difficultyOrder[b[key]] - difficultyOrder[a[key]];
      } else {
        return direction === 'ascending'
          ? a[key] < b[key] ? -1 : 1
          : b[key] < a[key] ? -1 : 1;
      }
    });

    setSortConfig({ key, direction });
    setProblems(sortedProblems);
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProblems = problems.filter(problem =>
    problem.ID.toString().includes(searchTerm) || problem.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = filteredProblems.reduce((count, problem) => {
    if (completedProblems[problem.ID]) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <div className="problems-overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="overlay-content">
        <button className="close-button" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h2>
          {company
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          }
        </h2>
        <p className="solved-count">({completedCount}/{filteredProblems.length})</p>
        <div className="progress-bar"><div className="progress" style={{ width: `${(completedCount/filteredProblems.length) * 100}%` }}></div></div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by ID or Title..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="problem-table">
          <div className="table-header">
            <div>Status</div>
            <div>ID <button className="sort-button" onClick={() => sortProblems('ID')}>{getSortIcon('ID')}</button></div>
            <div>Title <button className="sort-button" onClick={() => sortProblems('Title')}>{getSortIcon('Title')}</button></div>
            <div>Acceptance <button className="sort-button" onClick={() => sortProblems('Acceptance')}>{getSortIcon('Acceptance')}</button></div>
            <div>Difficulty <button className="sort-button" onClick={() => sortProblems('Difficulty')}>{getSortIcon('Difficulty')}</button></div>
            {page === 'companies' && <div>Frequency <button className="sort-button" onClick={() => sortProblems('Frequency')}>{getSortIcon('Frequency')}</button></div>}
          </div>
          {filteredProblems.map((problem, index) => (
            <div className="table-row" key={index}>
              <div>
                <input
                  type="checkbox"
                  checked={completedProblems[problem.ID]}
                  onChange={() => handleCheckboxChange(problem.ID)}
                />
              </div>
              <div>{problem.ID}</div>
              <div>
                <a href={problem['Leetcode Question Link']} target="_blank" rel="noopener noreferrer">
                  {problem.Title} <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
              <div>{problem.Acceptance}</div>
              <div className={problem.Difficulty.toLowerCase()}>{problem.Difficulty}</div>
              {page === 'companies' && <div>{Math.round(problem.Frequency * 100) / 100}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Problems;