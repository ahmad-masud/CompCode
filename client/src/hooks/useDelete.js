import axios from "axios";
import { useUser } from "../context/usercontext";
import { useAlerts } from "../context/alertscontext";

const useDelete = () => {
  const { dispatch, user } = useUser();
  const { addAlert } = useAlerts();

  const deleteAccount = async () => {
    if (!user) return;

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
      addAlert("Account deleted successfully", "success");
    } catch (error) {
      console.error("Account deletion error:", error);
      addAlert("Error deleting account", "error");
    }
  };

  return deleteAccount;
};

export default useDelete;
