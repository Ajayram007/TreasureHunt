import React, { useState } from "react";
import axios from "axios";
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
      const res = await axios.post("/login", formData);

      const { user, token } = res.data;

      // Save to Redux
      dispatch(authSuccess({ user, token }));

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/retrieve");
      } else {
        navigate(`/startgame/${user.id}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
        <button
          className="btn btn-secondary mb-4 mt-4 position-absolute top-0 start-0 ms-5 mt-5"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
      <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "420px" }}>
        
        {/* Back Button */}

        <h3 className="text-center mb-4 fw-bold">Login</h3>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit */}
          <div className="d-grid">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* Error */}
          {message && (
            <div className="alert alert-danger mt-3 mb-0 text-center">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
