import React, { useEffect, useState } from "react";
import "../styles/companies.css";
import { firestore } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import companies from "../content/roadmap.json";
import { useUser } from "../context/usercontext";
import { useNavigate } from "react-router-dom";
import Tree from "../components/tree";

const Roadmap = () => {
  const [companiesData, setCompaniesData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });
  const [uniqueProblems, setUniqueProblems] = useState([]);
  const [completedProblems, setCompletedProblems] = useState({});
  const [narrow, setNarrow] = useState(false);
  const [view, setView] = useState(localStorage.getItem("view") || "table");
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setNarrow(window.innerWidth <= 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCompaniesData = () => {
      const companiesInfo = companies.map((company) => {
        const solvedProblems = company.problems.filter(
          (problemId) => completedProblems[problemId]
        ).length;

        return {
          name: company.name,
          acceptance: company.acceptance || "N/A",
          solvedProblems,
          difficulty: company.difficulty || "Unknown",
          problems: company.problems || [],
          children: company.children || [],
        };
      });

      const sortedCompanies = [...companiesInfo].sort((a, b) => {
        if (sortConfig.key === "name") {
          return sortConfig.direction === "ascending"
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        } else if (sortConfig.key === "acceptance") {
          const aRate = a[sortConfig.key] || 0;
          const bRate = b[sortConfig.key] || 0;
          return sortConfig.direction === "ascending"
            ? aRate - bRate
            : bRate - aRate;
        } else if (sortConfig.key === "difficulty") {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return sortConfig.direction === "ascending"
            ? difficultyOrder[a[sortConfig.key]] -
                difficultyOrder[b[sortConfig.key]]
            : difficultyOrder[b[sortConfig.key]] -
                difficultyOrder[a[sortConfig.key]];
        } else if (sortConfig.key === "solved") {
          return sortConfig.direction === "ascending"
            ? a.solvedProblems / a.problems.length -
                b.solvedProblems / b.problems.length
            : b.solvedProblems / b.problems.length -
                a.solvedProblems / a.problems.length;
        }
        return 0;
      });

      const uniqueProblems = Array.from(
        new Set(companies.flatMap((company) => company.problems))
      );

      setCompaniesData(sortedCompanies);
      setUniqueProblems(uniqueProblems);
    };

    fetchCompaniesData();
  }, [sortConfig, completedProblems]);

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCompletedProblems(userData.completedProblems || {});
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      setCompletedProblems({});
    }
  }, [user]);

  const sortCompanies = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fa-solid fa-sort"></i>;
    }
    return sortConfig.direction === "ascending" ? (
      <i className="fa-solid fa-sort-down"></i>
    ) : (
      <i className="fa-solid fa-sort-up"></i>
    );
  };

  const completedCount = uniqueProblems.filter(
    (problemId) => completedProblems[problemId]
  ).length;

  return (
    <div className="companies-page">
      <p className="solved-count">
        {completedCount}
        <span> | {uniqueProblems.length}</span>
      </p>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${(completedCount / uniqueProblems.length) * 100 || 0}%`,
          }}
        ></div>
      </div>
      <div className="toggle-view">
        <button
          className={view === "table" ? "active" : ""}
          onClick={() => {
            setView("table");
            localStorage.setItem("view", "table");
          }}
        >
          Sequential
        </button>
        <button
          className={view === "tree" ? "active" : ""}
          onClick={() => {
            setView("tree");
            localStorage.setItem("view", "tree");
          }}
        >
          Hierarchical
        </button>
      </div>
      {view === "table" ? (
        <div className="company-table">
          <table>
            <thead>
              <tr>
                <th>
                  Name{" "}
                  <button
                    className="sort-button"
                    onClick={() => sortCompanies("name")}
                  >
                    {getSortIcon("name")}
                  </button>
                </th>
                {!narrow && (
                  <th>
                    Acceptance{" "}
                    <button
                      className="sort-button"
                      onClick={() => sortCompanies("acceptance")}
                    >
                      {getSortIcon("acceptance")}
                    </button>
                  </th>
                )}
                {!narrow && (
                  <th>
                    Solved{" "}
                    <button
                      className="sort-button"
                      onClick={() => sortCompanies("solved")}
                    >
                      {getSortIcon("solved")}
                    </button>
                  </th>
                )}
                <th>
                  Difficulty{" "}
                  <button
                    className="sort-button"
                    onClick={() => sortCompanies("difficulty")}
                  >
                    {getSortIcon("difficulty")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {companiesData.length > 0
                ? companiesData.map((company, index) => (
                    <tr key={index}>
                      <td>
                        <button
                          onClick={() =>
                            navigate(
                              `/roadmap/${company.name.replace(/\s+/g, "-").toLowerCase()}`
                            )
                          }
                        >
                          {company.name
                            .replaceAll("-", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                      </td>
                      {!narrow && <td>{company.acceptance}%</td>}
                      {!narrow && (
                        <td>
                          <div className="company-progress-bar">
                            <div
                              className="company-progress"
                              style={{
                                width: `${
                                  company.problems.length
                                    ? (company.solvedProblems /
                                        company.problems.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      )}
                      <td className={company.difficulty.toLowerCase()}>
                        {company.difficulty}
                      </td>
                    </tr>
                  ))
                : Array.from({ length: 20 }).map((_, index) => (
                    <div
                      className={`skeleton-table-row ${index % 2 !== 0 ? "skeleton" : ""}`}
                      key={index}
                    ></div>
                  ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="company-tree">
          <Tree companiesData={companiesData} />
        </div>
      )}
    </div>
  );
};

export default Roadmap;
