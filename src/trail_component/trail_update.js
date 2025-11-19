import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/trailUpdate.css";
import { checkAuth } from "../auth/checkAuth";


const TrailUpdate = () => {
  const { id } = useParams();
  const [level, setLevel] = useState(null);
  const [editValues, setEditValues] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`/users/trail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLevel(res.data.level);
        setEditValues(res.data.level.places); // Copy places for editing
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load level data");
      }
    };

    fetchLevel();
  }, [id]);

  // Save updated place name
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `/users/trail/${id}`,
        {
          index: editingIndex,
          newPlace: editValues[editingIndex],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/trailRetrieve");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="update-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>

      <div className="update-card">
        <h2>Update Level {id}</h2>

        {message && <p className="error">{message}</p>}

        {!level ? (
          <p className="loading">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="list-title">Click a place to edit</h3>

            <ul className="place-list">
              {editValues.map((place, i) => (
                <li
                  key={i}
                  className={`place-item ${editingIndex === i ? "active" : ""}`}
                  onClick={() => setEditingIndex(i)}
                >
                  {editingIndex === i ? (
                    <input
                      type="text"
                      value={editValues[i]}
                      onChange={(e) => {
                        const updated = [...editValues];
                        updated[i] = e.target.value;
                        setEditValues(updated);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span>{place}</span>
                  )}
                </li>
              ))}
            </ul>

            {editingIndex !== null && (
              <button type="submit" className="update-btn">
                Save Changes
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default checkAuth(TrailUpdate);
