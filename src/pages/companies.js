import React, { useEffect, useState } from 'react';
import '../styles/companies.css'; // Import CSS file for styles
import { firestore } from '../config/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import Problems from '../components/problems';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import companies from '../content/companies.json';

const average = (array) => {
  if (array.length === 0) return 0;
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
};

const Companies = ({ user, premiumInfo, theme }) => {
  const [companiesData, setCompaniesData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage, setCompaniesPerPage] = useState(20); // Number of companies to display per page

  const handleClose = () => {
    setOpenCompany("");
  };

  useEffect(() => {
    const fetchCompaniesData = async () => {
      const companiesInfo = companies.map(company => {
        const acceptanceRates = company.data.map(problem => problem.Acceptance);
        const difficulties = company.data.map(problem => problem.Difficulty);
        const numProblems = company.data.length;
        const avgAcceptance = acceptanceRates.length > 0 ? parseInt(average(acceptanceRates).toFixed(2)) + '%' : 'N/A';
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
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'ascending'
            ? (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1)
            : (a[sortConfig.key] < b[sortConfig.key] ? 1 : -1);
        } else if (sortConfig.key === 'avgAcceptance') {
          const aRate = parseFloat(a[sortConfig.key].replace('%', ''));
          const bRate = parseFloat(b[sortConfig.key].replace('%', ''));
          return sortConfig.direction === 'ascending'
            ? aRate - bRate
            : bRate - aRate;
        } else if (sortConfig.key === 'mostCommonDifficulty') {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return sortConfig.direction === 'ascending'
            ? difficultyOrder[a[sortConfig.key]] - difficultyOrder[b[sortConfig.key]]
            : difficultyOrder[b[sortConfig.key]] - difficultyOrder[a[sortConfig.key]];
        } else {
          return sortConfig.direction === 'ascending'
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
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
      setCompletedProblems({});
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

    setSortConfig({ key, direction });
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

  // Filter and paginate companies
  const filteredCompanies = companiesData
    .filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);

  const completedCount = uniqueProblems.reduce((count, problem) => {
    if (completedProblems[problem.ID]) {
      return count + 1;
    }
    return count;
  }, 0);

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  // Handle "Previous" and "Next" buttons
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

  // Generate pagination buttons with dynamic shifting but keep first and last page visible
  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2)); // Start from page 2 (since 1 is always shown)
    const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1); // Exclude last page (since it's always shown)

    // Always show the first page
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

    // Add "..." if there is a gap between 1 and the starting page
    if (startPage > 2) {
      pages.push(<button key="start-ellipsis" disabled>...</button>);
    }

    // Add page buttons within the visible range
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

    // Add "..." if there is a gap between the endPage and the last page
    if (endPage < totalPages - 1) {
      pages.push(<button key="end-ellipsis" disabled>...</button>);
    }

    // Always show the last page
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

  return (
    <>
      {openCompany && <Problems theme={theme} company={companies.find(company => company.name === openCompany)} onClose={handleClose} user={user} page={'companies'} premiumInfo={premiumInfo} />}
      <div className="companies-page">
        <p className="solved-count">{completedCount}<span> | {uniqueProblems.length}</span></p>
        <div className="progress-bar"><div className={completedCount === uniqueProblems.length ? "progress completed": "progress"} style={{ width: `${(completedCount/uniqueProblems.length) * 100}%` }}></div></div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="company-table">
          <table>
            <thead>
              <tr>
                <th>Name <button className="sort-button" onClick={() => sortCompanies('name')}>{getSortIcon('name')}</button></th>
                {!narrow && <th>Acceptance <button className="sort-button" onClick={() => sortCompanies('avgAcceptance')}>{getSortIcon('avgAcceptance')}</button></th>}
                <th>Problems <button className="sort-button" onClick={() => sortCompanies('numProblems')}>{getSortIcon('numProblems')}</button></th>
                <th>Difficulty <button className="sort-button" onClick={() => sortCompanies('mostCommonDifficulty')}>{getSortIcon('mostCommonDifficulty')}</button></th>
              </tr>
            </thead>
            <tbody>
              {currentCompanies.map((company, index) => (
                <tr key={index}>
                  <td><button onClick={() => setOpenCompany(company.name.toLowerCase())}>{company.name.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</button></td>
                  {!narrow && <td>{company.avgAcceptance}</td>}
                  <td>{company.numProblems}</td>
                  <td className={company.mostCommonDifficulty.toLowerCase()}>{company.mostCommonDifficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <Menu menuButton={<MenuButton className="page-button">{`${companiesPerPage} / page`}</MenuButton>}>
            <MenuItem onClick={() => setCompaniesPerPage(20)}>20 / page</MenuItem>
            <MenuItem onClick={() => setCompaniesPerPage(50)}>50 / page</MenuItem>
            <MenuItem onClick={() => setCompaniesPerPage(100)}>100 / page</MenuItem>
          </Menu>
          <div className='pages'>
            <button onClick={handlePreviousPage} disabled={currentPage === 1}><i className="fa-solid fa-angle-left"></i></button>
            {renderPageNumbers()}
            <button onClick={handleNextPage} disabled={currentPage === totalPages}><i className="fa-solid fa-angle-right"></i></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Companies;