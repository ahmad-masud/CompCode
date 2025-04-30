import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/usercontext";
import { useAlerts } from "../context/alertscontext";

export const useLogin = () => {
  const login = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/api/auth/google`;
  };

  return login;
};

export const useHandleRedirect = () => {
  const navigate = useNavigate();
  const { dispatch } = useUser();
  const { addAlert } = useAlerts();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      addAlert("No token provided", "error");
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = res.data;
        dispatch({ type: "LOGIN", payload: { uid: user.uid, email: user.email } });

        addAlert("Signed in successfully", "success");
        navigate("/");
      } catch (err) {
        console.error("Token verification failed:", err);
        addAlert("Login failed", "error");
        navigate("/");
      }
    };

    fetchUser();
  }, [addAlert, dispatch, navigate]);
};
