import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/trail_retrieve.css"; // <-- correct import
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { checkAuth } from "../auth/checkAuth";


const TrailRetrieve = () => {
  const [levels, setLevels] = useState([]);
  const [message, setMessage] = useState("");
    const navigate = useNavigate();

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/users/trail", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLevels(res.data.levels);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load trail data");
      }
    };

    fetchTrails();
  }, []);

  const handleClick = (lvl) => {
    if (!lvl?.levelNumber) {
      console.error("Error: levelNumber undefined", lvl);
      return;
    }
    navigate(`/trailRetrieve/${lvl.levelNumber}`);
    // 👉 You can navigate or show places here
  };

  return (
    <div className="trail-retrieve-wrapper">
      <Navbar></Navbar>
      <h2 className="title">All Trail Levels</h2>

      {message && <p className="retrieve-error">{message}</p>}

      {levels.length === 0 ? (
        <p className="empty-msg">No trail levels added yet.</p>
      ) : (
        <div className="trail-list">
          {levels.map((lvl) => (
            <div
              className="trail-level-card"
              key={lvl._id}
              onClick={() => handleClick(lvl)}
            >
              <h3>Level {lvl.levelNumber}</h3>

              {lvl.places.length === 0 ? (
                <p className="no-place">No places added.</p>
              ) : (
                <ul className="place-list">
                  {lvl.places.map((p, index) => (
                    <li key={index}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default checkAuth(TrailRetrieve);
