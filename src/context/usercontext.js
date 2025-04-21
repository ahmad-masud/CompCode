import React, { createContext, useContext, useReducer, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import CryptoJS from "crypto-js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
      return { ...state, user: action.payload };
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
  const auth = getAuth();

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch({ type: "LOGIN", payload: user });
      } else {
        dispatch({ type: "LOGOUT" });
      }
      dispatch({ type: "SET_LOADING", payload: false });
    });

    return () => unsubscribe();
  }, [auth]);

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!state.user) return;

      const userRef = doc(firestore, "users", state.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {});
        return;
      }

      const data = docSnap.data();
      dispatch({ type: "SET_PREMIUM_INFO", payload: data.premiumInfo || {} });
      dispatch({ type: "SET_THEME", payload: data.theme || "system" });
      if (data.completedLessons)
        Object.entries(data.completedLessons).forEach(([title, value]) =>
          dispatch({ type: "SET_COMPLETED_LESSON", payload: { title, value } })
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
    };

    fetchUserInfo();
  }, [state.user]);

  const setCompletedLesson = async (title, value) => {
    if (!state.user) return;
    dispatch({ type: "SET_COMPLETED_LESSON", payload: { title, value } });
    const userRef = doc(firestore, "users", state.user.uid);
    await updateDoc(userRef, { [`completedLessons.${title}`]: value });
  };

  const setCompletedProblem = async (id, value) => {
    if (!state.user) return;
    dispatch({ type: "SET_COMPLETED_PROBLEM", payload: { id, value } });
    const userRef = doc(firestore, "users", state.user.uid);
    await updateDoc(userRef, { [`completedProblems.${id}`]: value });
  };

  const setCompletedQuiz = async (title) => {
    if (!state.user) return;
    dispatch({ type: "SET_COMPLETED_QUIZ", payload: { title } });
    const userRef = doc(firestore, "users", state.user.uid);
    await updateDoc(userRef, { [`completedQuizzes.${title}`]: true });
  };

  const setTheme = async (theme) => {
    if (state.user) {
      dispatch({ type: "SET_THEME", payload: theme });
      const userRef = doc(firestore, "users", state.user.uid);
      await updateDoc(userRef, { theme });
    }
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
