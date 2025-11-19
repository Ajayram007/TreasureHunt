import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/retrieveid.css";
import { checkAuth } from "../auth/checkAuth";


const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/retrieve/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data.user);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to fetch user details");
      }
    };

    fetchUser();
  }, [id]);

  const deleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete this User?")) return;

    try {
      const token = localStorage.getItem("token"); // ✔ FIXED

      await axios.delete(`/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User deleted successfully!");
      navigate("/retrieve");

    } catch (err) {
      alert("Failed to delete User.");
    }
  };

  return (
    <div className="user-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <h2>User Details</h2>

      {message && <p className="error">{message}</p>}

      {user && (
        <div className="details-card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Group:</strong> {user.group}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Phone:</strong> {user.phonenumber}</p>

          {/* Pass ID when clicking Update */}
          <button onClick={() => navigate(`/update/${id}`)}>
            Update
          </button>

          <button onClick={deleteUser}>Delete</button>  {/* ✔ FIXED */}
        </div>
      )}
    </div>
  );
};

export default checkAuth(UserDetails);
