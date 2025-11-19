import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/trail_retrieve_id.css"; // Add this CSS file
import { checkAuth } from "../auth/checkAuth";

const TrailRetrieveId = () => {
  const { id } = useParams(); 
  const [level, setLevel] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        if (!id) {
          setMessage("Invalid level number");
          return;
        }

        const token = localStorage.getItem("token");

        const res = await axios.get(`/users/trail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLevel(res.data.level);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load level data");
      }
    };

    fetchLevel();
  }, [id]);


  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this level?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/users/trail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/trailRetrieve");
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="trail-id-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>

      <div className="trail-card">
        {message && <p className="error">{message}</p>}

        {!level ? (
          <p className="loading">Loading...</p>
        ) : (
          <>
            <h2 className="level-title">Level {level.levelNumber}</h2>

            {level.places.length === 0 ? (
              <p className="no-places">No places added</p>
            ) : (
              <ul className="place-list">
                {level.places.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}

            <div className="button-row">
              <button className="update-btn" onClick={() => navigate(`/trailUpdate/${id}`)}>
                Update
              </button>

              <button className="delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default checkAuth(TrailRetrieveId);
