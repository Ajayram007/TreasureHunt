import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout as logoutAction } from "./store/authSlice";
import { checkAuth } from "./auth/checkAuth";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.auth.user);

  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">
          Treasure Hunt
        </NavLink>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            {/* USER INFO */}
            {user && (
              <li className="nav-item me-3">
                <span className="nav-link text-white">
                  👤 {user.name} | {user.phonenumber}
                </span>
              </li>
            )}

            {/* ADMIN LINKS */}
            {user?.role === "admin" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/createUser">
                    Create User
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/retrieve">
                    Retrieve
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/trailRetrieve">
                    Trail
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/trailCreate">
                    Trail Create
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/PlayerList">
                    Player List
                  </NavLink>
                </li>
                {/* <li className="nav-item">
                  <NavLink className="nav-link" to="/QrGenerate">
                    QR Generate
                  </NavLink>
                </li> */}
              </>
            )}

            {/* LOGOUT / LOGIN */}
            {user ? (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light ms-2"
                  onClick={logout}
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default checkAuth(Navbar);
