import React, { useEffect, useState } from 'react';
import '../styles/companies.css'; // Import CSS file for styles

const average = (array) => {
  if (array.length === 0) return 0;
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
};

const Companies = ({ handleClick, user }) => {
  const [companiesData, setCompaniesData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const context = require.context('../content/problems', false, /\.json$/);
    const companyNames = context.keys().map(fileName => fileName.match(/\.\/(.*)\.json/)[1]);

    const companiesInfo = companyNames.map(company => {
      const data = require(`../content/problems/${company}.json`);
      const acceptanceRates = data.map(problem => parseFloat(problem.Acceptance.replace('%', '')));
      const difficulties = data.map(problem => problem.Difficulty);
      const numProblems = data.length;
      const avgAcceptance = acceptanceRates.length > 0 ? average(acceptanceRates).toFixed(2) + '%' : 'N/A';
      const mostCommonDifficulty = difficulties.length > 0 ? mostCommon(difficulties) : 'N/A';

      return {
        name: company.charAt(0).toUpperCase() + company.slice(1),
        avgAcceptance,
        numProblems,
        mostCommonDifficulty,
      };
    });

    const sortedCompanies = [...companiesInfo].sort((a, b) => {
      return sortConfig.direction === 'ascending'
        ? (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1)
        : (a[sortConfig.key] < b[sortConfig.key] ? 1 : -1);
    });

    setCompaniesData(sortedCompanies);
  }, [sortConfig.direction, sortConfig.key]);

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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCompanies = companiesData.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="companies-page">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="company-table">
        <table>
          <thead>
            <tr>
              <th>Name <button className="sort-button" onClick={() => sortCompanies('name')}>{getSortIcon('name')}</button></th>
              <th>Average Acceptance Rate <button className="sort-button" onClick={() => sortCompanies('avgAcceptance')}>{getSortIcon('avgAcceptance')}</button></th>
              <th>Number of Problems <button className="sort-button" onClick={() => sortCompanies('numProblems')}>{getSortIcon('numProblems')}</button></th>
              <th>Most Common Difficulty <button className="sort-button" onClick={() => sortCompanies('mostCommonDifficulty')}>{getSortIcon('mostCommonDifficulty')}</button></th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, index) => (
              <tr key={index}>
                <td>{company.name.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} <button onClick={() => handleClick(company.name.toLowerCase())}><i className="fa-solid fa-code"></i></button></td>
                <td>{company.avgAcceptance}</td>
                <td>{company.numProblems}</td>
                <td className={company.mostCommonDifficulty.toLowerCase()}>{company.mostCommonDifficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Companies;