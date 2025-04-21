import { useUser } from "../context/usercontext";
import { getAuth, deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../config/firebase-config";
import { useAlerts } from "../context/alertscontext";

const useDelete = () => {
  const { dispatch, user } = useUser();
  const { addAlert } = useAlerts();
  const auth = getAuth();

  const deleteAccount = async () => {
    if (!user) return;

    const userRef = doc(firestore, "users", user.uid);
    const currentUser = auth.currentUser;

    try {
      await deleteDoc(userRef);
      await deleteUser(currentUser);
      dispatch({ type: "LOGOUT" });
      addAlert("Account deleted successfully", "success");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        addAlert("Please re-authenticate and try again.", "warning");
      } else {
        console.error("Account deletion error:", error);
        addAlert("Error deleting account", "error");
      }
    }
  };

  return deleteAccount;
};

export default useDelete;
