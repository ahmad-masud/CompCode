import { useUser } from "../context/usercontext";
import { auth } from "../config/firebase-config";
import { signOut } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAlerts } from "../context/alertscontext";

const useLogout = () => {
  const { dispatch } = useUser();
  const { addAlert } = useAlerts();
  const functions = getFunctions();

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      addAlert("Signed out successfully", "success");
    } catch (error) {
      console.error("Logout error:", error);
      addAlert("Error signing out", "error");
    }
  };

  const logoutAllDevices = async () => {
    try {
      const logoutAll = httpsCallable(functions, "logoutAllDevices");
      await logoutAll();
      dispatch({ type: "LOGOUT" });
      addAlert("Logged out of all devices", "success");
    } catch (error) {
      console.error("Logout all devices error:", error);
      addAlert("Error logging out of all devices", "error");
    }
  };

  return { logout, logoutAllDevices };
};

export default useLogout;
