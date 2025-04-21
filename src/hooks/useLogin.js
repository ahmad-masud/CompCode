import { useUser } from "../context/usercontext";
import { auth, provider } from "../config/firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useAlerts } from "../context/alertscontext";

const useLogin = () => {
  const { dispatch } = useUser();
  const { addAlert } = useAlerts();

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      dispatch({ type: "LOGIN", payload: result.user });
      addAlert("Signed in successfully", "success");
    } catch (error) {
      console.error("Login error:", error);
      addAlert("Error signing in", "error");
    }
  };

  return login;
};

export default useLogin;
