import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import { useUser } from "../context/usercontext";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setTheme(userData.theme || "system");
          }
        })
        .catch((error) => {
          console.error("Error fetching user theme data:", error);
        });
    }
  }, [user]);

  useEffect(() => {
    if (theme === "system") {
      const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.querySelector(":root").className = isDarkMode ? "dark" : "light";
    } else {
      document.querySelector(":root").className = theme;
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      updateDoc(userRef, { theme: newTheme }).catch((error) => {
        console.error("Error updating theme:", error);
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
