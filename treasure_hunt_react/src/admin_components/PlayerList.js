import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import { checkAuth } from "../auth/checkAuth";

const AdminPlayersList = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch players + automatic sort by oldest completed first
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/admin/player", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Automatic sort: Oldest completed first
        const sorted = (res.data.players || []).sort((a, b) => {
          // 1️⃣ Pending goes to bottom
          if (!a.endTime && b.endTime) return 1;   // a is pending → move down
          if (a.endTime && !b.endTime) return -1;  // b is pending → move down

          // 2️⃣ Both completed → sort by oldest endTime first
          if (a.endTime && b.endTime) {
            return new Date(a.endTime) - new Date(b.endTime);
          }

          // 3️⃣ Both pending → keep original order
          return 0;
        });


        setPlayers(sorted);
        setFilteredPlayers(sorted);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to fetch players");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Search only (no sort dropdown needed)
  useEffect(() => {
    let updated = [...players];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      updated = updated.filter((item) => {
        const name = item.playerId?.name?.toLowerCase() || "";
        const phone = String(item.playerId?.phonenumber || "");
        return name.includes(q) || phone.includes(search);
      });
    }

    setFilteredPlayers(updated);
  }, [search, players]);

  return (
    <div className="container my-5">
      <Navbar />

      <h2 className="mb-4 text-center fw-bold" style={{ color: "#0d6efd" }}>
         LEADERBOARD
      </h2>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {message && <div className="alert alert-danger text-center">{message}</div>}

      {/* Search Only  */}
      <div className="row mb-4 g-3 justify-content-center">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div
        className="leaderboard-table shadow-lg rounded overflow-hidden"
        style={{
          maxHeight: "75vh",
          overflowY: "auto",
          background: "linear-gradient(135deg, #0d6efd, #0b5ed7)",
          color: "white",
          borderRadius: "16px",
        }}
      >
        {filteredPlayers.length === 0 && !loading ? (
          <div className="text-center py-5 text-white">
            <h4>No players found</h4>
            <p>Try adjusting your search.</p>
          </div>
        ) : (
          <table className="table table table-hover mb-0">
            <thead className="table-primary text-dark">
              <tr>
                <th>RANKING</th>
                <th>PLAYER NAME</th>
                <th>PHONE</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th>END TIME</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((item, index) => (
                <tr
                  key={item._id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/PlayerId/${item.playerId?._id}`)}
                  className="table-row-hover"
                >
                  <td className="fw-bold fs-5">
                    { `${index + 1}.`}
                  </td>
                  <td>{item.playerId?.name || "N/A"}</td>
                  <td>{item.playerId?.phonenumber || "N/A"}</td>
                  <td>{item.playerId?.department || "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${item.endTime ? "bg-success" : "bg-warning text-dark"}`}
                    >
                      {item.endTime ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {item.endTime ? new Date(item.endTime).toLocaleString("en-GB") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default checkAuth(AdminPlayersList);