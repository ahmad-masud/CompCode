import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [premiumInfo, setPremiumInfo] = useState({
    premium: false,
    subscriptionId: "",
    canceled: false,
    customerId: "",
    subscriptionEnd: null,
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((docSnap) => {
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
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
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

  return (
    <UserContext.Provider value={{ user, setUser, premiumInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
