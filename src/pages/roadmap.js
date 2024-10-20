import React, { useEffect, useState } from 'react';
import '../styles/companies.css';
import { firestore } from '../config/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import Problems from '../components/problems';
import companies from '../content/roadmap.json';

const average = (array) => {
  if (array.length === 0) return 0;
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
};

const Roadmap = ({ user, theme }) => {
  const [companiesData, setCompaniesData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [uniqueProblems, setUniqueProblems] = useState([]);
  const [completedProblems, setCompletedProblems] = useState({});
  const [openCompany, setOpenCompany] = useState("");
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

  const handleClose = () => {
    setOpenCompany("");
  };

  useEffect(() => {
    const fetchCompaniesData = async () => {
      // Iterate through the order to retrieve company data in the correct sequence
      const companiesInfo = companies.map(company => {
        const acceptanceRates = company.data.map(problem => parseFloat(problem.Acceptance.replace('%', '')));
        const difficulties = company.data.map(problem => problem.Difficulty);
        const numProblems = company.data.length;
        const avgAcceptance = acceptanceRates.length > 0 ? average(acceptanceRates).toFixed(2) + '%' : 'N/A';
        const mostCommonDifficulty = difficulties.length > 0 ? mostCommon(difficulties) : 'N/A';

        return {
          name: company.name.charAt(0).toUpperCase() + company.name.slice(1),
          avgAcceptance,
          numProblems,
          mostCommonDifficulty,
          problems: company.data,
        };
      });

      const sortedCompanies = [...companiesInfo].sort((a, b) => {
        if (sortConfig.key  === 'name') {
          return sortConfig.direction === 'ascending'
            ? (a[sortConfig.key ] > b[sortConfig.key ] ? 1 : -1)
            : (a[sortConfig.key ] < b[sortConfig.key ] ? 1 : -1);
        } else if (sortConfig.key  === 'avgAcceptance') {
          const aRate = parseFloat(a[sortConfig.key ].replace('%', ''));
          const bRate = parseFloat(b[sortConfig.key ].replace('%', ''));
          return sortConfig.direction === 'ascending'
            ? aRate - bRate
            : bRate - aRate;
        } else if (sortConfig.key  === 'mostCommonDifficulty') {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return sortConfig.direction === 'ascending'
            ? difficultyOrder[a[sortConfig.key ]] - difficultyOrder[b[sortConfig.key ]]
            : difficultyOrder[b[sortConfig.key ]] - difficultyOrder[a[sortConfig.key ]];
        } else {
          return sortConfig.direction === 'ascending'
            ? a[sortConfig.key ] - b[sortConfig.key ]
            : b[sortConfig.key ] - a[sortConfig.key ];
        }
      });

      const allProblems = companiesInfo.flatMap(company => company.problems);
      const uniqueProblems = Array.from(new Set(allProblems.map(problem => problem.ID)))
        .map(id => allProblems.find(problem => problem.ID === id));

      setCompaniesData(sortedCompanies);
      setUniqueProblems(uniqueProblems);
    };

    fetchCompaniesData();
  }, [sortConfig]);

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCompletedProblems(userData.completedProblems || {});
        }
      }).catch((error) => {
        console.error("Error fetching user data: ", error);
      });
    } else {
      const completedProblemsFromLocalStorage = JSON.parse(localStorage.getItem('completedProblems'));
      setCompletedProblems(completedProblemsFromLocalStorage || {});
    }
  }, [user, openCompany]);

  const mostCommon = (array) => {
    if (array.length === 0) return 'N/A';

    // Count occurrences of each difficulty level
    const counts = {};
    array.forEach(difficulty => {
      counts[difficulty] = (counts[difficulty] || 0) + 1;
    });

    // Find the difficulty with the highest count
    let mostCommonDifficulty = null;
    let maxCount = -1;
    Object.keys(counts).forEach(difficulty => {
      if (counts[difficulty] > maxCount) {
        mostCommonDifficulty = difficulty;
        maxCount = counts[difficulty];
      }
    });

    return mostCommonDifficulty || 'N/A';
  };

  const sortCompanies = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedCompanies = [...companiesData].sort((a, b) => {
      if (key === 'name') {
        return direction === 'ascending'
          ? (a[key] > b[key] ? 1 : -1)
          : (a[key] < b[key] ? 1 : -1);
      } else if (key === 'avgAcceptance') {
        const aRate = parseFloat(a[key].replace('%', ''));
        const bRate = parseFloat(b[key].replace('%', ''));
        return direction === 'ascending'
          ? aRate - bRate
          : bRate - aRate;
      } else if (key === 'mostCommonDifficulty') {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return direction === 'ascending'
          ? difficultyOrder[a[key]] - difficultyOrder[b[key]]
          : difficultyOrder[b[key]] - difficultyOrder[a[key]];
      } else {
        return direction === 'ascending'
          ? a[key] - b[key]
          : b[key] - a[key];
      }
    });

    setSortConfig({ key, direction });
    setCompaniesData(sortedCompanies);
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

  const completedCount = uniqueProblems.reduce((count, problem) => {
    if (completedProblems[problem.ID]) {
      return count + 1;
    }
    return count;
  }, 0);
  
  return (
    <>
      {openCompany && <Problems theme={theme} company={companies.find(company => company.name === openCompany)} onClose={handleClose} user={user} page={'roadmap'} />}
      <div className="companies-page">
        <p className="solved-count">{completedCount}<span> | {uniqueProblems.length}</span></p>
        <div className="progress-bar"><div className="progress" style={{ width: `${(completedCount/uniqueProblems.length) * 100}%` }}></div></div>
        <div className="company-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                {!narrow && <th>Acceptance <button className="sort-button" onClick={() => sortCompanies('avgAcceptance')}>{getSortIcon('avgAcceptance')}</button></th>}
                {!narrow && <th>Problems <button className="sort-button" onClick={() => sortCompanies('numProblems')}>{getSortIcon('numProblems')}</button></th>}
                <th>Difficulty <button className="sort-button" onClick={() => sortCompanies('mostCommonDifficulty')}>{getSortIcon('mostCommonDifficulty')}</button></th>
              </tr>
            </thead>
            <tbody>
              {companiesData.map((company, index) => (
                <tr key={index}>
                  <td>
                    <button onClick={() => setOpenCompany(company.name.toLowerCase())}>
                      {company.name.replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  </td>
                  {!narrow && <td>{company.avgAcceptance}</td>}
                  {!narrow && <td>{company.numProblems}</td>}
                  <td className={company.mostCommonDifficulty.toLowerCase()}>{company.mostCommonDifficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Roadmap;