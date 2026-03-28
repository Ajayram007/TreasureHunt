import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";


const GenerateQR = () => {
  const navigate = useNavigate();
  
  const { levelNumber: paramLevel, questionIndex: paramIndex } = useParams();
  const [levelNumber, setLevelNumber] = useState(paramLevel || "");
  const [questionIndex, setQuestionIndex] = useState(paramIndex || "");

  const [qrCode, setQrCode] = useState(null);
  const [question, setQuestion] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
  if (paramLevel && paramIndex) {
    handleGenerate({ preventDefault: () => {} });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQrCode(null);
    setQuestion(null);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/player/generate-qr",
        {
          levelNumber: Number(levelNumber),
          questionIndex: Number(questionIndex),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQrCode(res.data.qrCode);
      setQuestion(res.data.question);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };


  // 📥 Download QR as PNG
const downloadPNG = () => {
  const link = document.createElement("a");
  link.href = qrCode;          // qrCode is base64
  link.download = `QR_L${levelNumber}_Q${questionIndex}.png`;
  link.click();
};

// 📄 Download QR as PDF
const downloadPDF = () => {
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text(`Level ${levelNumber} - Question ${questionIndex}`, 20, 20);

  pdf.addImage(qrCode, "PNG", 40, 30, 120, 120);
  pdf.save(`QR_L${levelNumber}_Q${questionIndex}.pdf`);
};


  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h2 className="mb-0">Generate QR</h2>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleGenerate}>
            {/* LEVEL NUMBER */}
            <div className="mb-3">
              <label className="form-label">Level Number</label>
              <input
  type="number"
  className="form-control"
  value={levelNumber}
  onChange={(e) => setLevelNumber(e.target.value)}
  readOnly={!!paramLevel}
/>
            </div>

            {/* QUESTION INDEX */}
            <div className="mb-3">
              <label className="form-label">Question Index</label>
              <input
  type="number"
  className="form-control"
  value={questionIndex}
  onChange={(e) => setQuestionIndex(e.target.value)}
  readOnly={!!paramIndex}
/>
              <div className="form-text">
                Index starts from <strong>0</strong>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Generating…" : "Generate QR"}
            </button>
          </form>

          {/* ERROR */}
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="alert alert-success mt-3">
              {message}
            </div>
          )}

          {/* QUESTION PREVIEW */}
          {question && (
            <div className="alert alert-info mt-3">
              <h6 className="mb-1">Question Preview</h6>
              <p className="mb-0">{question.Text}</p>
            </div>
          )}

          {/* QR RESULT */}
          {qrCode && (
  <div className="text-center mt-4">
    <h5 className="mb-3">Generated QR Code</h5>

    <img
      src={qrCode}
      alt="QR Code"
      className="img-fluid border p-2 mb-3"
      style={{ maxWidth: "280px" }}
    />

    <div className="d-flex justify-content-center gap-2">
      <button
        className="btn btn-outline-primary"
        onClick={downloadPNG}
      >
        ⬇ Download PNG
      </button>

      <button
        className="btn btn-outline-danger"
        onClick={downloadPDF}
      >
        📄 Download PDF
      </button>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default checkAuth(GenerateQR);
