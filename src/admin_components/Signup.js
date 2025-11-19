import React, { useState } from "react";
import axios from "axios";
import "../styles/Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "",
    department: "",
    phonenumber: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("/signup", formData);
      setMessage(res.data.message);
      setFormData({ name: "", password: "", role: "", department: "", phonenumber: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="signup-container">
        <button className="back-btn " onClick={() => navigate("/")}>← Back</button>
      <div className="signup-card">

        <h2 className="signup-title">Sign Up</h2>

        {message && <p className="signup-message">{message}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="phonenumber" placeholder="Phone Number" value={formData.phonenumber} onChange={handleChange} minLength={10} />
          <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
