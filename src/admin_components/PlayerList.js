import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/player.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { checkAuth } from "../auth/checkAuth";

const AdminPlayersList = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("none");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ------------------------------------------
  // FETCH PLAYERS
  // ------------------------------------------
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("https://treasurehuntbackend-y0nc.onrender.com/admin/player", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPlayers(res.data.players || []);
        setFilteredPlayers(res.data.players || []);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to fetch players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // ------------------------------------------
  // FILTER + SEARCH + SORT
  // ------------------------------------------
  useEffect(() => {
    let updated = [...players];

    // 🔍 Search by name or phone (convert phone to string)
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      updated = updated.filter((item) => {
        const name = item.playerId?.name?.toLowerCase() || "";
        const phone = String(item.playerId?.phonenumber || ""); // 👈 FIXED

        return name.includes(q) || phone.includes(search);
      });
    }

    // 🔽 Sort by endTime
    if (sortOrder === "latest") {
      updated.sort(
        (a, b) => new Date(b.endTime || 0) - new Date(a.endTime || 0)
      );
    } else if (sortOrder === "oldest") {
      updated.sort(
        (a, b) => new Date(a.endTime || 0) - new Date(b.endTime || 0)
      );
    }

    setFilteredPlayers(updated);
  }, [search, sortOrder, players]);

  return (
    <div className="players-wrapper">
      <Navbar />

      <button
        className="back-btn"
        style={{ marginTop: "70px" }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2 className="title">Players Progress</h2>

      {loading && <p className="loading">Loading...</p>}
      {message && <p className="error">{message}</p>}

      {/* --------------------------------------
          SEARCH + SORT CONTROLS
      --------------------------------------- */}
      <div className="filters-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or phone number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="sort-container">
        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="none">Sort by End Time</option>
          <option value="latest">Latest Completed</option>
          <option value="oldest">Earliest Completed</option>
        </select>
      </div>

      {/* --------------------------------------
          PLAYERS LIST
      --------------------------------------- */}
      <div className="players-grid">
        {filteredPlayers.map((item) => (
          <div
            key={item._id}
            className="player-card"
            onClick={() => navigate(`/PlayerId/${item.playerId?._id}`)}
            style={{ cursor: "pointer" }}
          >
            <h3>{item.playerId?.name}</h3>
            <p>
              <strong>Phone:</strong> {item.playerId?.phonenumber}
            </p>
            <p>
              <strong>Department:</strong> {item.playerId?.department}
            </p>

            <p>
              <strong>Completed:</strong> {item.endTime ? "Yes" : "No"}
            </p>

            {item.endTime && (
              <p>
                <strong>End Time:</strong>{" "}
                {new Date(item.endTime).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default checkAuth(AdminPlayersList);
