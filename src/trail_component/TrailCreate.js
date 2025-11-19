import React, { useState } from "react";
import axios from "axios";
import "../styles/trail_component.css";
import Navbar from "../navbar";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";


const TrailCreate = () => {
  const [form, setForm] = useState({
    levelNumber: "",
    place: "",
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/users/trailCreate",
        {
          levelNumber: Number(form.levelNumber),
          place: form.place.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);

      // Redirect only after success
      setTimeout(() => {
        navigate("/trailRetrieve");
      }, 800); // delay so user sees success message

      // Reset form
      setForm({ levelNumber: "", place: "" });

    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating trail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trail-wrapper">
      <Navbar />

      <div className="trail-card">
        <h2>Create Trail Level</h2>

        {message && <p className="trail-message">{message}</p>}

        <form className="trail-form" onSubmit={handleSubmit}>
          <label>Level Number (1–5)</label>
          <input
            type="number"
            name="levelNumber"
            value={form.levelNumber}
            onChange={handleChange}
            min="1"
            max="5"
            required
          />

          <label>Place Name</label>
          <input
            type="text"
            name="place"
            value={form.place}
            onChange={handleChange}
            placeholder="Enter place name"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Add Trail"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default checkAuth(TrailCreate);
