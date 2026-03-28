import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { checkAuth } from "../auth/checkAuth";

const Retrieve = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/retrieve", {
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
    navigate(`/retrieve/${id}`);
  };


return (
  <>

    <div className="container mt-5">
    <Navbar />
      <h3 className="mb-4 fw-bold text-center">Users List</h3>

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      )}

      {message && (
        <div className="alert alert-danger text-center">
          {message}
        </div>
      )}

      {/* Scrollable Users List */}
      <div 
        className="users-container shadow-sm rounded p-3"
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          border: '1px solid #dee2e6',
          backgroundColor: '#fff'
        }}
      >
        <div className="row g-4">
          {users.map((user) => (
            <div key={user._id} className="col-md-6 col-lg-4">
              <div
                className="card shadow-sm h-100 cursor-pointer"
                role="button"
                onClick={() => handleUserClick(user._id)}
              >
                <div className="card-body">
                  <h5 className="card-title text-primary mb-2">
                    {user.name}
                  </h5>
                  <p className="card-text mb-1">
                    <strong>Phone:</strong> {user.phonenumber}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Role:</strong> {user.role}
                  </p>
                  <span className="badge bg-secondary">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && users.length === 0 && (
          <div className="text-center mt-5 text-muted">
            No users found.
          </div>
        )}
      </div>
    </div>
  </>
);
};

export default checkAuth(Retrieve);
