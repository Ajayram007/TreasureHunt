import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import "./styles/navbar.css";
import { logout as logoutAction } from "./store/authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Read user directly from Redux store
  const user = useSelector((store) => store.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const togglerRef = useRef(null);

  const toggleNavbar = () => setIsOpen(!isOpen);

  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        togglerRef.current &&
        !togglerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <nav className="bossy-navbar" ref={navRef}>
      <button
        className="bossy-navbar-toggler"
        ref={togglerRef}
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        <span className="bossy-navbar-toggler-icon"></span>
      </button>

      <div className={`bossy-navbar-collapse ${isOpen ? "show" : ""}`}>
        <ul className="bossy-navbar-nav">

          {/* 👤 USER INFO SECTION */}
          {user && (
            <li className="bossy-nav-item">
              <button className="bossy-user-info">
                <span>{user.name}</span> | <span>{user.phonenumber}</span>
              </button>
            </li>
          )}

          {/* ADMIN ROUTES */}
          {user?.role === "admin" && (
            <>
              <li className="bossy-nav-item">
                <NavLink
                  to="/createUser"
                  className={({ isActive }) =>
                    "bossy-nav-link " + (isActive ? "active" : "")
                  }
                >
                  Create User
                </NavLink>
              </li>

              <li className="bossy-nav-item">
                <NavLink
                  to="/retrieve"
                  className={({ isActive }) =>
                    "bossy-nav-link " + (isActive ? "active" : "")
                  }
                >
                  Retrieve
                </NavLink>
              </li>

              <li className="bossy-nav-item">
                <NavLink
                  to="/trailRetrieve"
                  className={({ isActive }) =>
                    "bossy-nav-link " + (isActive ? "active" : "")
                  }
                >
                  trail
                </NavLink>
              </li>
              <li className="bossy-nav-item">
                <NavLink
                  to="/trailCreate"
                  className={({ isActive }) =>
                    "bossy-nav-link " + (isActive ? "active" : "")
                  }
                >
                  trailCreate
                </NavLink>
              </li>
              <li className="bossy-nav-item">
                <NavLink
                  to="/PlayerList"
                  className={({ isActive }) =>
                    "bossy-nav-link " + (isActive ? "active" : "")
                  }
                >
                  PlayerList
                </NavLink>
              </li>
              <li className="bossy-nav-item">
                <NavLink
                  to="/QrGenerate"
                  className={({ isActive }) =>
                    "bossy-nav-link " + (isActive ? "active" : "")
                  }
                >
                  Qr-Generate
                </NavLink>
              </li>
            </>
          )}

          {/* LOGOUT BUTTON */}
          {user ? (
            <li className="bossy-nav-item">
              <button onClick={logout} className="bossy-nav-link1">
                Logout
              </button>
            </li>
          ) : (
            <li className="bossy-nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "bossy-nav-link " + (isActive ? "active" : "")
                }
              >
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
