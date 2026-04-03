import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const TrailRetrieveId = () => {
  const { levelNumber, questionIndex } = useParams();
  const [question, setQuestion] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const lvl = Number(levelNumber);
        const qIndex = Number(questionIndex);

        if (Number.isNaN(lvl) || Number.isNaN(qIndex)) {
          setMessage("Invalid level or question index");
          return;
        }

        const token = localStorage.getItem("token");

        const res = await axios.get(`/trail/trail/${lvl}/${qIndex}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestion(res.data.question);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load question");
      }
    };

    fetchQuestion();
  }, [levelNumber, questionIndex]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`/trail/trailDelete/${levelNumber}/${questionIndex}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate(-1);
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  // Helper function to render media
  const renderMedia = (fileProp, imageProp) => {
    const file = fileProp || imageProp;
    if (!file) return null;

    const backendUrl = (axios.defaults.baseURL || "http://localhost:3000").replace(/\/$/, "");
    const fileUrl = file.startsWith("http") ? file : `${backendUrl}/uploads/${file}`;

    if (fileUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
      return (
        <img
          src={fileUrl}
          alt="attachment"
          className="img-fluid rounded shadow-sm"
          style={{ maxWidth: "400px", maxHeight: "250px", objectFit: "cover" }}
        />
      );
    }

    if (fileUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video
          controls
          className="img-fluid rounded shadow-sm"
          style={{ maxWidth: "400px", maxHeight: "250px" }}
        >
          <source src={fileUrl} />
        </video>
      );
    }

    // Other file types
    return (
      <p>
        <a href={fileUrl} target="_blank" rel="noreferrer">
          📎 View Attachment
        </a>
      </p>
    );
  };

  return (
    <div className="container py-4">
      {/* Back Button */}
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/trailRetrieve")}>
        ⬅ Back
      </button>

      {/* Alert */}
      {message && <div className="alert alert-danger text-center">{message}</div>}

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h5 className="mb-0">
            Level {levelNumber} — Question {Number(questionIndex) + 1}
          </h5>
        </div>

        <div className="card-body">
          {!question ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              {/* Question Text */}
              <div className="mb-3">
                <h6 className="fw-bold">Question</h6>
                <p className="text-muted">{question.Text}</p>
              </div>

              {/* Answer */}
              <div className="mb-3">
                <h6 className="fw-bold">Answer</h6>
                <span className="badge bg-success fs-6">{question.answer}</span>
              </div>

              {/* Media */}
              {question.file && <div className="mb-4 text-center">{renderMedia(question.file)}</div>}

              {/* Buttons */}
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-warning"
                  onClick={() => navigate(`/trailUpdate/${levelNumber}/${questionIndex}`)}
                >
                  ✏️ Update
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                  🗑 Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default checkAuth(TrailRetrieveId);
