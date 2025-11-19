import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import QRScanner from "./QRScanner";
import "../styles/startgame.css";
import "../styles/QRScanner.css";
import { checkAuth } from "../auth/checkAuth";

const StartGame = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [progressId, setProgressId] = useState(null);
  const [nextTarget, setNextTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  // -----------------------------
  // START GAME
  // -----------------------------
  const startGame = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/player/start-game/${playerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProgressId(res.data.progressId || null);
      setNextTarget(res.data.nextTarget || null);
      setMessage(res.data.message || "Game started");
      setCompleted(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to start game");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // HANDLE SCAN FROM QRScanner
  // parsed = { levelNumber, place }
  // -----------------------------
const handleScan = async (parsed) => {
  console.log("📥 Parsed QR Received =", parsed);   // <--- ADD THIS

  setScanning(false);
  setError("");
  setMessage("Verifying...");

  if (!parsed?.levelNumber || !parsed?.place) {
    setError("Invalid QR detected");
    setMessage("");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    console.log("📤 Sending to backend =", {
      levelNumber: parsed.levelNumber,
      place: parsed.place,
    });

    const res = await axios.post(
      `/player/verify-qr/${playerId}`,
      {
        levelNumber: parsed.levelNumber,
        place: parsed.place,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Backend Response =", res.data);

    setMessage(res.data.message || "Verified");

    if (res.data.nextTarget) {
      setNextTarget(res.data.nextTarget);
    } else {
      setCompleted(true);
      setNextTarget(null);
    }
  } catch (err) {
    console.log("❌ Backend Error =", err.response?.data);  // <--- ADD THIS
    setError(err.response?.data?.message || "Verification failed");
    setMessage("");
  }
};


  return (
    <div className="startgame-page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="page-title">Treasure Hunt</h1>
      </div>

      <div className="card">
        {/* START SCREEN */}
        {!nextTarget && !completed && (
          <div className="center">
            <p className="lead">Press start to get your first clue.</p>
            <button className="primary" onClick={startGame} disabled={loading}>
              {loading ? "Starting…" : "Start Game"}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        )}

        {/* GAME PROGRESS */}
        {nextTarget && !completed && (
          <>
            <div className="clue-section">
              <h2>Level {nextTarget.levelNumber}</h2>
              <p className="clue">{nextTarget.place}</p>
            </div>

            <button className="secondary" onClick={() => setScanning(true)}>
              Scan QR
            </button>

            {scanning && (
              <QRScanner onScan={handleScan} />
            )}

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
          </>
        )}

        {/* COMPLETED */}
        {completed && (
          <div className="complete-card">
            <h2>🎉 Congratulations!</h2>
            <p>You finished the trail.</p>
            <button className="primary" onClick={() => navigate("/")}>
              Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default checkAuth(StartGame);
