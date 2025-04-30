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
    logout();
  };

  return { logout, logoutAllDevices };
};

export default useLogout;
