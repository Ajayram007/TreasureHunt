import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Decode current user ID from JWT
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const uid = payload.id || payload.userId || payload._id || payload.sub;
        setCurrentUserId(uid);
      } catch (e) {
        console.warn("Failed to decode JWT", e);
      }
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`/retrieve/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to fetch user details");
      }
    };

    fetchUser();
  }, [id]);

  const isOwnProfile = currentUserId && currentUserId === id;

  const deleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted successfully!");
      navigate("/retrieve");
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container my-4">
      <button className="btn btn-secondary mb-5" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="mb-4">User Details</h2>

      {message && <div className="alert alert-danger">{message}</div>}

      {user && (
        <div className="card shadow-lg">
          <div className="card-body">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Department:</strong> {user.department}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Phone:</strong> {user.phonenumber}</p>

            {isOwnProfile && (
              <div className="alert alert-info mt-3 mb-4">
                <strong>Note:</strong> This is your own profile — delete & update actions are restricted here.
              </div>
            )}

            <div className="mt-4 d-flex gap-3 flex-wrap">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/update/${id}`)}
                disabled={isOwnProfile}
              >
                {isOwnProfile ? "Update (not allowed)" : "Update"}
              </button>

              <button
                className={`btn ${isOwnProfile ? "btn-outline-danger" : "btn-danger"}`}
                onClick={deleteUser}
                disabled={isOwnProfile}
              >
                {isOwnProfile ? "Delete (not allowed)" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default checkAuth(UserDetails);