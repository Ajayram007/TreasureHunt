import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Update.css";
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

        // Fill the form fields with DB values
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
      navigate("/retrieve");   // change this to your actual retrieve page route
    }, 800);

    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

   

  return (
    <div className="update-container">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>

      <h2>Update User</h2>

      {message && <p className="update-message">{message}</p>}

      <form className="update-form" onSubmit={handleUpdate}>

        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          required
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phonenumber"
          value={user.phonenumber}
          onChange={handleChange}
        />

        <label>Department</label>
        <input
          type="text"
          name="department"
          value={user.department}
          onChange={handleChange}
        />

        <label>User Role</label>
        <select name="role" value={user.role} onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button className="update-button" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update User"}
        </button>
      </form>
    </div>
  );
};

export default checkAuth(AdminUpdateUser);
