import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const GenerateQR = () => {
  const [levelNumber, setLevelNumber] = useState("");
  const [place, setPlace] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setQrCode("");

    try {
      const token = localStorage.getItem("token");

      // JSON to encode inside QR
      const qrPayload = {
        levelNumber: Number(levelNumber),
        place: place.trim()
      };

      const res = await axios.post(
        "/player/generate-qr",
        qrPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`QR generated for Level ${levelNumber}, Place ${place}`);
      setQrCode(res.data.qrCode); // backend returns BASE64 image

    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "450px" }}>
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Generate QR Code</h1>

      <form onSubmit={handleGenerate} style={{ marginBottom: "20px" }}>
        <div>
          <label>Level Number:</label>
          <input
            type="number"
            value={levelNumber}
            onChange={(e) => setLevelNumber(e.target.value)}
            required
            style={{ marginLeft: "10px" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Place:</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            required
            style={{ marginLeft: "48px" }}
          />
        </div>

        <button
          type="submit"
          style={{ marginTop: "15px", padding: "10px 20px" }}
        >
          {loading ? "Generating..." : "Generate QR"}
        </button>
      </form>

      {message && <p style={{ fontWeight: "bold" }}>{message}</p>}

      {qrCode && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated QR Code:</h3>

          <img
            src={qrCode}
            alt="Generated QR"
            style={{ width: "220px", height: "220px", border: "1px solid #000", padding: "5px" }}
          />

          <a
            href={qrCode}
            download={`QR_Level_${levelNumber}_Place_${place}.png`}
          >
            <button style={{ marginTop: "10px", padding: "8px 15px" }}>
              Download QR
            </button>
          </a>

          <p style={{ marginTop: "10px", fontSize: "14px" }}>
            Encoded JSON: <b>{`{"levelNumber":${levelNumber},"place":"${place}"}`}</b>
          </p>
        </div>
      )}
    </div>
  );
};

export default checkAuth(GenerateQR);
