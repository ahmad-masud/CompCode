import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import CryptoJS from "crypto-js";

const UserContext = createContext();

const ENCRYPTION_KEY =
  process.env.REACT_APP_USER_ENCRYPTION_KEY || "default_key";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    return cachedUser ? decryptData(cachedUser) : null;
  });

  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: "",
    canceled: false,
    customerId: "",
    subscriptionEnd: null,
  });

  const fetchPremiumInfo = async (userId) => {
    try {
      const userRef = doc(firestore, "users", userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.premiumInfo) {
          setPremiumInfo({
            premium: userData.premiumInfo.premium || false,
            subscriptionId: userData.premiumInfo.subscriptionId || "",
            canceled: userData.premiumInfo.canceled || false,
            customerId: userData.premiumInfo.stripeCustomerId || "",
            subscriptionEnd: userData.premiumInfo.subscriptionEnd || null,
          });
        }
      } else {
        throw new Error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching premium info: ", error);
      setPremiumInfo({
        premium: false,
        subscriptionId: "",
        canceled: false,
        customerId: "",
        subscriptionEnd: null,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPremiumInfo(user.uid);
    } else {
      setPremiumInfo({
        premium: false,
        subscriptionId: "",
        canceled: false,
        customerId: "",
        subscriptionEnd: null,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", encryptData(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{ user, setUser, premiumInfo, fetchPremiumInfo }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
