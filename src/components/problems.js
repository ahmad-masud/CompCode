import React, { useState, useEffect } from 'react';
import '../styles/problems.css'; 
import { firestore } from '../config/firebase-config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../context/alertscontext';
import Solution from './solution';

const Problems = ({ company, user, onClose, page, premiumInfo, theme }) => {
  const [problems, setProblems] = useState([]);
  const [completedProblems, setCompletedProblems] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'Difficulty', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { addAlert } = useAlerts();
  const [problemId, setProblemId] = useState(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage, setProblemsPerPage] = useState(20); 
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) {
        setNarrow(true);
      } else {
        setNarrow(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (company && company.data) {
      const sortedData = company.data.sort((a, b) => {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[a.Difficulty] - difficultyOrder[b.Difficulty];
      });
      setProblems(sortedData);
    } else {
      console.error("Company data not found");
    }
  }, [page, company]);  

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCompletedProblems(userData.completedProblems || {}); 
        } else {
          
          setDoc(userRef, { completedProblems: {} });
        }
      }).catch((error) => {
        console.error("Error fetching user data: ", error);
      });
    } else {
      setCompletedProblems({});
    }
  }, [user]);

  const handleCheckboxChange = async (problemId) => {
    if (!user) {
      addAlert('Sign in to track your progress', 'warning');
      return;
    }

    const newCompletedProblems = { ...completedProblems, [problemId]: !completedProblems[problemId] };
    setCompletedProblems(newCompletedProblems);

    const userRef = doc(firestore, 'users', user.uid);
    await updateDoc(userRef, { completedProblems: newCompletedProblems }).catch(async (error) => {
      if (error.code === 'not-found') {
        await setDoc(userRef, { completedProblems: newCompletedProblems });
      } else {
        console.error("Error updating user data: ", error);
      }
    });
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

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const completedCount = filteredProblems.reduce((count, problem) => {
    if (completedProblems[problem.ID]) {
      return count + 1;
    }
    return count;
  }, 0);

  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (totalPages > 0) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={currentPage === 1 ? 'active' : ''}
          disabled={currentPage === 1}
        >
          1
        </button>
      );
    }

    if (startPage > 2) {
      pages.push(<button key="start-ellipsis" disabled>...</button>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'active' : ''}
          disabled={currentPage === i}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      pages.push(<button key="end-ellipsis" disabled>...</button>);
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={currentPage === totalPages ? 'active' : ''}
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };
  
  const handleSolutionClick = (id) => {
    setIsSolutionOpen(true);
    setProblemId(id);
  };

  return (
    <div className="problems-overlay">
      {isSolutionOpen && <Solution problemId={problemId} onClose={() => setIsSolutionOpen(false)} theme={theme} />}
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="problems-overlay-content">
        <button className="close-button" onClick={onClose}><i className="bi bi-x"></i></button>
        <h2>
          {company && company.name.replace(/\b\w/g, c => c.toUpperCase())}
        </h2>
        <p className="solved-count">{completedCount}<span> | {filteredProblems.length}</span></p>
        <div className="progress-bar"><div className={completedCount === filteredProblems.length ? "progress completed": "progress"} style={{ width: `${(completedCount / filteredProblems.length) * 100}%` }}></div></div>
        {page === "roadmap" && <div className='roadmap-lessons'>
          {company && company.lessons && company.lessons.map((lesson, index) => (
            <div onClick={() => navigate(`/lesson/${lesson}`)} key={index} className='roadmap-lesson'>
              <p>{lesson.replace(/\b\w/g, c => c.toUpperCase()).replaceAll('-', ' ')}</p>
            </div>
          ))}
        </div>}
        {page === "companies" && <div className="search-container">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          /> 
        </div> }
        <div className="problem-table">
          <div className="table-header">
            <div className='check-head'>Status</div>
            <div className='title-head'>Problem <button className="sort-button" onClick={() => sortProblems('ID')}>{getSortIcon('ID')}</button></div>
            {!narrow && page === 'roadmap' && <div className='solution-link-head'>Solution</div>}
            {!narrow && <div>Acceptance <button className="sort-button" onClick={() => sortProblems('Acceptance')}>{getSortIcon('Acceptance')}</button></div>}
            <div className="difficulty-head">Difficulty <button className="sort-button" onClick={() => sortProblems('Difficulty')}>{getSortIcon('Difficulty')}</button></div>
            {page === 'companies' && !narrow && <div className="frequency-head">Frequency {premiumInfo && premiumInfo.premium && <button className="sort-button" onClick={() => sortProblems('Frequency')}>{getSortIcon('Frequency')}</button>}</div>}
          </div>
          {currentProblems.map((problem, index) => (
            <div className="table-row" key={index}>
              <div className='check'>
                <button onClick={() => handleCheckboxChange(problem.ID)}>
                  {completedProblems[problem.ID] ? <i className="fa-solid fa-square-check"></i> : <i className="fa-regular fa-square"></i> }
                </button>
              </div>
              <div className='title'>
                <a href={problem['Leetcode Question Link']} target="_blank" rel="noopener noreferrer">
                  {problem.ID}. {problem.Title}
                </a>
              </div>
              {!narrow && page === 'roadmap' && <div className='solution-link'>
                <button onClick={() => handleSolutionClick(problem.ID)}>
                  <i className="fa-regular fa-lightbulb"></i>
                </button>
              </div>}
              {!narrow && <div>{`${problem.Acceptance}%`}</div>}
              <div className={`difficulty ${problem.Difficulty.toLowerCase()}`}>{problem.Difficulty}</div>
              {page === 'companies' && !narrow && (
                <div className='frequency'>
                  {premiumInfo && premiumInfo.premium ? (
                    Math.round(problem.Frequency * 100) / 100
                  ) : (
                    <Link to="/premium" className='premium-link'><i className="fa-solid fa-crown"></i></Link>  
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {problems.length > 20 && <div className="pagination">
          <Menu menuButton={<MenuButton className="page-button">{`${problemsPerPage} / page`}</MenuButton>}>
            <MenuItem onClick={() => setProblemsPerPage(20)}>20 / page</MenuItem>
            <MenuItem onClick={() => setProblemsPerPage(50)}>50 / page</MenuItem>
            <MenuItem onClick={() => setProblemsPerPage(100)}>100 / page</MenuItem>
          </Menu>
          <div className='pages'>
            <button onClick={handlePreviousPage} disabled={currentPage === 1}><i className="fa-solid fa-angle-left"></i></button>
            {renderPageNumbers()}
            <button onClick={handleNextPage} disabled={currentPage === totalPages}><i className="fa-solid fa-angle-right"></i></button>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default Problems;