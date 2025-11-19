import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Retrieve.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { checkAuth } from "../auth/checkAuth";


const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("retrieve", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (id) => {
    navigate(`/retrieve/${id}`); // Navigate to detailed page
  };
const createUser = (id) => {
    navigate(`/createUser`); // Navigate to detailed page
  };
  return (
    
    <div className="users-container">
      <Navbar></Navbar>
      <button onClick={(createUser)}>Createuser</button>
      <h2>Users List</h2>

      {loading && <p>Loading users...</p>}
      {message && <p className="message">{message}</p>}

      <div className="users-grid">
        {users.map((user) => (
          <div
            key={user._id}
            className="user-card"
            onClick={() => handleUserClick(user._id)}
          >
            <ol>
            <p className="user-name">NAME : {user.name}</p>
            <p className="user-phone">PHONE NUMBER - {user.phonenumber}</p>
            </ol>
          </div>
        ))}
      </div>
    </div>
    
  );
};

export default checkAuth(AdminUsersList);
