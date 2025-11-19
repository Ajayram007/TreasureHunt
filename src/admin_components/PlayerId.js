import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import "../styles/player.css";
import { checkAuth } from "../auth/checkAuth";

const PlayerId = () => {
  const { playerId } = useParams();
  const [progress, setProgress] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`/admin/player/${playerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProgress(res.data.progress);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to fetch player details");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [playerId]);

  return (
    <div className="players-wrapper">
      <Navbar />

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="title">Player Full Details</h2>

      {loading && <p className="loading">Loading...</p>}
      {message && <p className="error">{message}</p>}

      {progress && (
        <div className="player-full-card">
          
          {/* Basic User Details */}
          <h3>NAME: {progress.playerId?.name}</h3>
          <p><strong>Phone:</strong> {progress.playerId?.phonenumber}</p>
          <p><strong>Department:</strong> {progress.playerId?.department}</p>

          <hr />

          {/* Game Progress Details */}
          <p><strong>Current Level:</strong> {progress.currentLevelNumber}</p>
          <p><strong>Place Index:</strong> {progress.placeIndex}</p>

          <p>
            <strong>Start Time:</strong>{" "}
            {progress.startTime
              ? new Date(progress.startTime).toLocaleString()
              : "Not started"}
          </p>

          <p>
            <strong>End Time:</strong>{" "}
            {progress.endTime
              ? new Date(progress.endTime).toLocaleString()
              : "Not completed"}
          </p>

          <hr />

          {/* Display Path Array */}
          <h3>Player Path</h3>
          {progress.path?.length > 0 ? (
            <ul className="path-list">
              {progress.path.map((p, index) => (
                <li key={p._id} className="path-item">
                  <strong>Level {p.levelNumber}:</strong> {p.place}
                </li>
              ))}
            </ul>
          ) : (
            <p>No path data available.</p>
          )}

          <hr />

          {/* Display Time Logs */}
          {/* <h3>Time Log</h3> */}
          <h3>Time Log</h3>
{progress.timeLog?.length > 0 ? (
  <ul className="path-list">
    {progress.timeLog.map((log, index) => {
      const date = new Date(log.scannedAt);

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");

      const timeFormatted = `${hours}:${minutes}:${seconds}`;

      return (
        <li key={index} className="path-item">
          <strong>Level {log.level}</strong> → {timeFormatted}
        </li>
      );
    })}
  </ul>
) : (
  <p>No time logs recorded.</p>
)}


        </div>
      )}
    </div>
  );
};

export default checkAuth(PlayerId);
