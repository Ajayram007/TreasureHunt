import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
// import Navbar from "../navbar";
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
    <div className="container py-4">
      {/* <Navbar /> */}

      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="mb-4 text-center">Player Full Details</h2>

      {loading && <div className="text-center text-muted">Loading...</div>}
      {message && <div className="alert alert-danger">{message}</div>}

      {progress && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            {/* Basic User Details */}
            <h4 className="card-title mb-3">{progress.playerId?.name}</h4>
            <p><strong>Phone:</strong> {progress.playerId?.phonenumber}</p>
            <p><strong>Department:</strong> {progress.playerId?.department}</p>

            <hr />

            {/* Game Progress Details */}
            <h5>Game Progress</h5>
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

            {/* Player Path */}
            <h5>Player Path</h5>
            {progress.path?.length > 0 ? (
              <ul className="list-group mb-3">
                {progress.path.map((p, index) => (
                  <li key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Level {p.levelNumber}</span>
                    <div>Question: {p.Text}</div>
                    <div className="text-muted">Answer: {p.answer}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No path data available.</p>
            )}

            {/* Time Logs */}
            <h5>Time Log</h5>
            {progress.timeLog?.length > 0 ? (
              <ul className="list-group">
                {progress.timeLog.map((log, index) => {
                  const date = new Date(log.scannedAt);
                  const hours = date.getHours().toString().padStart(2, "0");
                  const minutes = date.getMinutes().toString().padStart(2, "0");
                  const seconds = date.getSeconds().toString().padStart(2, "0");
                  const timeFormatted = `${hours}:${minutes}:${seconds}`;

                  return (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Level {log.level}</span>
                      <span className="badge bg-success rounded-pill">{timeFormatted}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted">No time logs recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default checkAuth(PlayerId);
