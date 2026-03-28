import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { checkAuth } from "../auth/checkAuth";

const CreateUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phonenumber: "",
    department: "",
    role: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phonenumber.trim()) {
      newErrors.phonenumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phonenumber.trim())) {
      newErrors.phonenumber = "Phone number must be exactly 10 digits";
    }
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const res = await axios.post("/create", 
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message || "User created successfully!");

      // Reset form
      setFormData({
        name: "",
        phonenumber: "",
        department: "",
        role: "",
        password: "",
      });

      // Redirect after 1.5 seconds (optional)
      setTimeout(() => {
        navigate("/retrieve");
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create user";
      setMessage(errorMsg);

      // Handle backend field-specific errors (if your API returns them)
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="container my-5">
      <Navbar />
        {/* <button className="btn btn-secondary mb-4 mt-5" onClick={() => navigate(-1)}>
          ← Back
        </button> */}

        <div className="card shadow-sm p-4 mx-auto mt-5" style={{ maxWidth: "500px" }}>
          <h2 className="mb-4 text-center">Create User</h2>

          {message && (
            <div
              className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
              role="alert"
            >
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="phonenumber"
                className={`form-control ${errors.phonenumber ? "is-invalid" : ""}`}
                placeholder="Enter 10-digit phone number"
                value={formData.phonenumber}
                onChange={handleChange}
                maxLength={10}
              />
              {errors.phonenumber && <div className="invalid-feedback">{errors.phonenumber}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Department <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="department"
                className={`form-control ${errors.department ? "is-invalid" : ""}`}
                placeholder="Enter department"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <div className="invalid-feedback">{errors.department}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Role <span className="text-danger">*</span>
              </label>
              <select
                name="role"
                className={`form-select ${errors.role ? "is-invalid" : ""}`}
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>

            <div className="mb-4 position-relative">
              <label className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default checkAuth(CreateUser);