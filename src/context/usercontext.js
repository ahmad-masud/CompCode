import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import CryptoJS from "crypto-js";

const UserContext = createContext();

const ENCRYPTION_KEY = process.env.REACT_APP_USER_ENCRYPTION_KEY || "default_key";

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

  const [premiumInfo, setPremiumInfo] = useState(() => {
    const cachedPremiumInfo = localStorage.getItem("premiumInfo");
    return cachedPremiumInfo
      ? decryptData(cachedPremiumInfo)
      : {
          premium: false,
          subscriptionId: "",
          canceled: false,
          customerId: "",
          subscriptionEnd: null,
        };
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.premiumInfo) {
              const updatedPremiumInfo = {
                premium: userData.premiumInfo.premium || false,
                subscriptionId: userData.premiumInfo.subscriptionId || "",
                canceled: userData.premiumInfo.canceled || false,
                customerId: userData.premiumInfo.stripeCustomerId || "",
                subscriptionEnd: userData.premiumInfo.subscriptionEnd || null,
              };
              setPremiumInfo(updatedPremiumInfo);
              localStorage.setItem("premiumInfo", encryptData(updatedPremiumInfo));
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      const defaultPremiumInfo = {
        premium: false,
        subscriptionId: "",
        canceled: false,
        customerId: "",
        subscriptionEnd: null,
      };
      setPremiumInfo(defaultPremiumInfo);
      localStorage.removeItem("premiumInfo");
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
    <UserContext.Provider value={{ user, setUser, premiumInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);