import React, { createContext, useContext, useReducer, useEffect } from "react";
import CryptoJS from "crypto-js";
import axios from "axios";
import { useAlerts } from "./alertscontext";

const UserContext = createContext();

const ENCRYPTION_KEY =
  process.env.REACT_APP_USER_ENCRYPTION_KEY || "default_key";

const encrypt = (data) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
const decrypt = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const initialState = {
  user: null,
  name: "",
  email: "",
  photo: "",
  premiumInfo: {},
  theme: "system",
  completedLessons: {},
  completedProblems: {},
  completedQuizzes: {},
  userLoading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, userLoading: action.payload };
    case "LOGIN":
      return {
        ...state,
        user: { uid: action.payload.uid, email: action.payload.email },
        name: action.payload.name,
        photo: action.payload.photo,
      };
    case "LOGOUT":
      return { ...initialState, theme: state.theme };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_PREMIUM_INFO":
      return { ...state, premiumInfo: action.payload };
    case "SET_COMPLETED_LESSON":
      return {
        ...state,
        completedLessons: {
          ...state.completedLessons,
          [action.payload.title]: action.payload.value,
        },
      };
    case "SET_COMPLETED_PROBLEM":
      return {
        ...state,
        completedProblems: {
          ...state.completedProblems,
          [action.payload.id]: action.payload.value,
        },
      };
    case "SET_COMPLETED_QUIZ":
      return {
        ...state,
        completedQuizzes: {
          ...state.completedQuizzes,
          [action.payload.title]: true,
        },
      };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const persisted = decrypt(localStorage.getItem("userData"));
  const [state, dispatch] = useReducer(reducer, persisted || initialState);
  const { addAlert } = useAlerts();

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    const token = localStorage.getItem("token");

    if (!token) {
      dispatch({ type: "LOGOUT" });
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;
        dispatch({
          type: "LOGIN",
          payload: {
            uid: data.uid,
            email: data.email,
            name: data.name,
            photo: data.photo,
          },
        });
        dispatch({ type: "SET_PREMIUM_INFO", payload: data.premiumInfo || {} });
        dispatch({ type: "SET_THEME", payload: data.theme || "system" });

        if (data.completedLessons)
          Object.entries(data.completedLessons).forEach(([title, value]) =>
            dispatch({
              type: "SET_COMPLETED_LESSON",
              payload: { title, value },
            })
          );
        if (data.completedProblems)
          Object.entries(data.completedProblems).forEach(([id, value]) =>
            dispatch({ type: "SET_COMPLETED_PROBLEM", payload: { id, value } })
          );
        if (data.completedQuizzes)
          Object.entries(data.completedQuizzes).forEach(([title, value]) => {
            if (value)
              dispatch({ type: "SET_COMPLETED_QUIZ", payload: { title } });
          });
      } catch (err) {
        if (err.response && err.response.status === 403) {
          addAlert("Session expired or invalid", "info");
          console.log("Session expired or invalid");
        } else {
          console.error("Failed to load user data:", err);
        }
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchUserInfo();
  }, [addAlert]);

  useEffect(() => {
    localStorage.setItem("userData", encrypt(state));
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme) => {
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };
    applyTheme(state.theme);
  }, [state.theme]);

  const setCompletedLesson = async (title, value) => {
    if (!state.user) return;
    dispatch({ type: "SET_COMPLETED_LESSON", payload: { title, value } });
    await axios.patch(
      `${process.env.REACT_APP_SERVER_URL}/api/user/completed-lesson`,
      { title, value },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  const setCompletedProblem = async (id, value) => {
    if (!state.user) return;
    dispatch({ type: "SET_COMPLETED_PROBLEM", payload: { id, value } });
    await axios.patch(
      `${process.env.REACT_APP_SERVER_URL}/api/user/completed-problem`,
      { id, value },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  const setCompletedQuiz = async (title) => {
    if (!state.user) return;
    dispatch({ type: "SET_COMPLETED_QUIZ", payload: { title } });
    await axios.patch(
      `${process.env.REACT_APP_SERVER_URL}/api/user/completed-quiz`,
      { title },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  const setTheme = async (theme) => {
    if (!state.user) return;
    dispatch({ type: "SET_THEME", payload: theme });
    await axios.patch(
      `${process.env.REACT_APP_SERVER_URL}/api/user/theme`,
      { theme },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        dispatch,
        setCompletedLesson,
        setCompletedProblem,
        setCompletedQuiz,
        setTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
