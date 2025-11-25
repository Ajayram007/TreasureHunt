import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authSuccess } from "../store/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("https://treasurehuntbackend-y0nc.onrender.com/login", formData,{withCredentials:true;});

      const user = response.data.user;
      const token = response.data.token;

      // 1️⃣ Save to Redux
      dispatch(authSuccess({ user, token }));

      // 2️⃣ Also save to localStorage (optional)
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // 3️⃣ Redirect based on role
      if (user.role === "admin") {
        navigate("/retrieve");
      } else {
        navigate(`/startgame/${user.id}`);

      }

    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Server Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button onClick={() => navigate("/")}>← Back</button>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Login;
