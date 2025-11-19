import React, { useState } from "react";
import axios from "axios";
import "../styles/createUser.css"; 
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";


const AdminCreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "",
    department: "",
    phonenumber: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token"); // Admin JWT token
      const response = await axios.post("/create", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(response.data.message);
      setFormData({
        name: "",
        password: "",
        role: "",
        department: "",
        phonenumber: ""
      });

      setTimeout(() =>{
        navigate("/retrieve");
      },300);
    } catch (error) {
      setMessage(error.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="signup-card">
        <h2 className="signup-title">Create User</h2>

        {message && <p className="signup-message">{message}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phonenumber"
            placeholder="Phone Number"
            value={formData.phonenumber}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default checkAuth(AdminCreateUser);
