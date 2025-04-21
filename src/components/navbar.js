import React, { useEffect, useState } from "react";
import "../styles/navbar.css";
import Google from "../content/images/google.webp";
import { Link } from "react-router-dom";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import Confirm from "../components/confirm";
import { useUser } from "../context/usercontext";
import useLogin from "../hooks/useLogin";
import useLogout from "../hooks/useLogout";

const Navbar = ({ onSettingsOpen }) => {
  const [narrow, setNarrow] = useState(false);
  const [displayConfirm, setDisplayConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const { user } = useUser();
  const login = useLogin();
  const { logout } = useLogout();

  useEffect(() => {
    const handleResize = () => {
      setNarrow(window.innerWidth <= 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const confirmAction = () => {
    login();
    setDisplayConfirm(false);
  };

  const showConfirm = (message) => {
    setConfirmMessage(message);
    setDisplayConfirm(true);
  };

  return (
    <div>
      {displayConfirm && (
        <Confirm
          onClose={() => setDisplayConfirm(false)}
          message={confirmMessage}
          onConfirm={confirmAction}
        />
      )}
      <div className="navbar">
        <div className="navbar-container">
          <div className="left">
            <i className="fa-solid fa-meteor"></i>
            <div className="nav-links">
              <Link className="nav-link" to="/">
                {narrow ? <i className="fa-solid fa-house" /> : "Home"}
              </Link>
              <Link className="nav-link" to="/companies">
                {narrow ? <i className="fa-solid fa-building" /> : "Companies"}
              </Link>
              <Link className="nav-link" to="/roadmap">
                {narrow ? <i className="fa-solid fa-share-nodes" /> : "Roadmap"}
              </Link>
              <Link className="nav-link" to="/lessons">
                {narrow ? <i className="fa-solid fa-brain" /> : "Lessons"}
              </Link>
            </div>
          </div>
          <div className="right">
            <Link to="/premium" className="premium-button">
              <i className="fa-solid fa-rocket"></i> {!narrow && "Premium"}
            </Link>
            {user ? (
              <div className="login-right">
                <Menu
                  menuButton={
                    <MenuButton className="user-button">
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="user-avatar"
                      />
                    </MenuButton>
                  }
                >
                  <MenuItem onClick={onSettingsOpen}>
                    <i className="fa-solid fa-gear"></i> Settings
                  </MenuItem>
                  <hr className="menu-divider" />
                  <MenuItem onClick={logout}>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>{" "}
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            ) : (
              <button
                className="login-button"
                onClick={() =>
                  showConfirm(
                    "By confirming you agree to our Terms and Conditions"
                  )
                }
              >
                <img src={Google} alt="google" />
                {!narrow && "Continue with Google"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
