import React from "react";
import "../styles/Home.css";
 // ✅ Ensure correct path!
import {  useNavigate } from "react-router-dom";

const Home = () => {
  

  const navigate = useNavigate();
  // Navigate  to login
  const Login = () => {
    navigate("/login");
  };
  // Navigate  to signup
  const Signup = () => {
    navigate("/signup");
  };
  return (
    <div className="tracker-container">
      <div className="card-container">
        <img src="icons.png" alt="" width="200" height="160"/>
        <h2>Treasure Hunt</h2>
      {/* Stylish Login & Signup Buttons */}
        <div className="button-container">
          <button className="btn signup-btn" onClick={Signup}>Sign Up</button>
          <button className="btn login-btn" onClick={Login}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
