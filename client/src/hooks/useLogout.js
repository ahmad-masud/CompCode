import { useUser } from "../context/usercontext";
import { useAlerts } from "../context/alertscontext";

const useLogout = () => {
  const { dispatch } = useUser();
  const { addAlert } = useAlerts();

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    addAlert("Signed out successfully", "success");
  };

  const logoutAllDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/logout-of-all-devices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (res.status === 200) {
        logout();
      } else if (res.status === 403) {
        logout();
        addAlert("Session expired. You have been signed out.", "warning");
      } else {
        throw new Error("Logout failed");
      }
    } catch (err) {
      console.error("Logout of all devices failed:", err);
      addAlert("Failed to log out of all devices", "error");
    }
  };  

  return { logout, logoutAllDevices };
};

export default useLogout;
