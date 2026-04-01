import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import QRScanner from "./QRScanner";
import { checkAuth } from "../auth/checkAuth";

const StartGame = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState({
    nextTarget: null,
    totalLevels: 0,
    currentLevel: 0, // ✅ COMPLETED levels only
    completed: false,
    message: "",
    error: "",
    scanning: false,
    loading: true
  });

  /* ---------------- START / RESUME GAME ---------------- */
  const fetchGameState = useCallback(async () => {
  setGameState(prev => ({
    ...prev,
    loading: true,
    error: "",
    message: ""
  }));

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`/player/start-game/${playerId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("START-GAME RESPONSE:", res.data); // keep for debugging

    const data = res.data;

    // Force completion logic if nextTarget is null (covers backend gaps)
    const isCompleted = data.completed === true || data.nextTarget === null;

    if (isCompleted) {
      setGameState({
        nextTarget: null,
        totalLevels: data.totalLevels || 0,
        currentLevel: data.totalLevels || 0,
        completed: true,
        message: data.message || "You have already completed the game!",
        error: "",
        scanning: false,
        loading: false
      });
    } else {
      const completedLevels = data.nextTarget?.levelNumber
        ? data.nextTarget.levelNumber - 1
        : 0;

      setGameState({
        nextTarget: data.nextTarget,
        totalLevels: data.totalLevels || 0,
        currentLevel: completedLevels,
        completed: false,
        message: data.message || "Game resumed!",
        error: "",
        scanning: false,
        loading: false
      });
    }
  } catch (err) {
    console.error("START-GAME ERROR:", err.response?.data || err.message);
    setGameState(prev => ({
      ...prev,
      error: err.response?.data?.message || "Unable to load game status",
      loading: false
    }));
  }
}, [playerId]);

  useEffect(() => {
    fetchGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  /* ---------------- HANDLE QR ---------------- */
  const handleScan = useCallback(async (parsed) => {
    if (!parsed?.answer) {
      setGameState(prev => ({
        ...prev,
        error: "Invalid QR! Missing answer.",
        message: ""
      }));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`/player/verify-qr/${playerId}`,
        { answer: parsed.answer.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.nextTarget) {
        // ✅ One level completed → derive from backend
        const completedLevels = res.data.nextTarget.levelNumber - 1;

        setGameState(prev => ({
          ...prev,
          nextTarget: res.data.nextTarget,
          currentLevel: completedLevels,
          message: res.data.message,
          error: "",
          scanning: false
        }));
      } else {
        // ✅ Final level completed
        setGameState(prev => ({
          ...prev,
          completed: true,
          currentLevel: prev.totalLevels, // 3/3
          nextTarget: null,
          message: res.data.message,
          error: "",
          scanning: false
        }));
      }
    } catch (err) {
      setGameState(prev => ({
        ...prev,
        error: err.response?.data?.message || "Verification failed",
        message: "",
        scanning: false
      }));
    }
  }, [playerId]);

  /* ---------------- FILE RENDER ---------------- */
  const renderFile = (file) => {
    if (!file) return null;
    const fileUrl = `/uploads/${file}`;

    if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
      return <img src={fileUrl} alt="clue" className="img-fluid rounded" />;
    }
    if (/\.(mp4|webm|ogg)$/i.test(file)) {
      return <video src={fileUrl} controls className="w-100 rounded" />;
    }
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer">
        📎 View Attachment
      </a>
    );
  };

  /* ---------------- CIRCULAR PROGRESS ---------------- */
  const size = 70;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeCurrent = Math.min(gameState.currentLevel, gameState.totalLevels);

  const progress =
    gameState.totalLevels > 0
      ? (safeCurrent / gameState.totalLevels) * 100
      : 0;

  const renderCircle = () => (
    <>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e9ecef"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#0d6efd"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </>
  );

  const {
    nextTarget,
    completed,
    totalLevels,
    message,
    error,
    scanning,
    loading
  } = gameState;

  return (
    <div className="container py-4">

      {/* TOP BAR */}
      <div className="d-flex align-items-center mb-2">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h2 className="m-0">Treasure Hunt</h2>
      </div>

      {/* PROGRESS */}
      {!completed && totalLevels > 0 && !loading && (
        <div className="d-flex justify-content-center my-3">
          <svg width={size} height={size}>
            {renderCircle()}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#0d6efd"
            >
              {safeCurrent}/{totalLevels}
            </text>
          </svg>
        </div>
      )}

      {/* CARD */}
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body text-center py-3 px-3">

              {loading ? (
                <p>Loading...</p>
              ) : completed ? (
                <>
                  <h4 className="text-success">🎉 Congratulations!</h4>
                  <p>You finished the trail.</p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => navigate("/")}
                  >
                    Home
                  </button>
                </>
              ) : nextTarget ? (
                <>
                  <h5>Level {nextTarget.levelNumber}</h5>
                  <p className="small">{nextTarget.Text}</p>

                  {nextTarget.file && (
                    <div className="mt-2">{renderFile(nextTarget.file)}</div>
                  )}

                  <button
                    className="btn btn-success mt-3"
                    onClick={() =>
                      setGameState(prev => ({ ...prev, scanning: true }))
                    }
                  >
                    Scan QR
                  </button>

                  {scanning && (
                    <div className="mt-3">
                      <QRScanner onScan={handleScan} />
                    </div>
                  )}

                  {message && (
                    <div className="alert alert-success mt-3 py-2">
                      {message}
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-danger mt-3 py-2">
                      {error}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p>Press start to get your first clue.</p>
                  <button className="btn btn-primary" onClick={fetchGameState}>
                    Start Game
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default checkAuth(StartGame);
