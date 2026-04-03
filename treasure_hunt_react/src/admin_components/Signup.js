import React, { useState } from "react";
import axios from "axios";
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
      setFormData({
        name: "",
        password: "",
        role: "",
        department: "",
        phonenumber: ""
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      {/* Back Button */}
        <button
          className="btn btn-secondary mb-4 mt-4 position-absolute top-0 start-0 ms-5 mt-5"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
      <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "420px" }}>
        

        <h3 className="text-center mb-4">Sign Up</h3>

        {message && (
          <div className="alert alert-info text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="phonenumber"
              placeholder="Phone Number"
              value={formData.phonenumber}
              onChange={handleChange}
              minLength={10}
            />
          </div>

          {/* Department */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Password */}
          <div className="mb-4">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
