import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const AdminUpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: "",
    phonenumber: "",
    department: "",
    role: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/retrieve/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser({
          name: res.data.user.name || "",
          phonenumber: res.data.user.phonenumber || "",
          department: res.data.user.department || "",
          role: res.data.user.role || ""
        });

      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load user data");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`/update/${id}`, user, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("User updated successfully!");
      setTimeout(() => {
        navigate("/retrieve");
      }, 800);

    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>← Back</button>

      <div className="card shadow-sm p-4">
        <h2 className="mb-4">Update User</h2>

        {message && (
          <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={user.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phonenumber"
              className="form-control"
              value={user.phonenumber}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-control"
              value={user.department}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">User Role</label>
            <select
              name="role"
              className="form-select"
              value={user.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option> 
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default checkAuth(AdminUpdateUser);
