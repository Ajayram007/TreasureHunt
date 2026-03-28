import React, { useEffect, useState } from "react";
import axios from "axios";
import { checkAuth } from "../auth/checkAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";

const TrailList = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  

  useEffect(() => {
    fetchLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLevels = async () => {
    try {
      const res = await axios.get("/trail/All_trail", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLevels(res.data.levels);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load trail levels");
      setLoading(false);
    }
  };

  const goToLevel = (levelNumber, questionIndex) => {
    navigate(`/trail/${levelNumber}/${questionIndex}`);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Navbar />
      <h2 className="mb-4 text-center">🧩 Trail Levels</h2>

      {levels.length === 0 ? (
        <div className="alert alert-warning">No levels found</div>
      ) : (
        <div className="accordion" id="trailAccordion">
          {levels.map((level, index) => (
            <div className="accordion-item" key={level._id}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#level-${level._id}`}
                >
                  Level {level.levelNumber}
                </button>
              </h2>

              <div
                id={`level-${level._id}`}
                className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                data-bs-parent="#trailAccordion"
              >
                <div className="accordion-body">
                  {level.questions.map((q, i) => (
                    <div className="card mb-3 shadow-sm" key={i}>
                      <div
                        className="card-body"
                        onClick={() => goToLevel(level.levelNumber, i)}
                      >
                        <h6 className="card-title">Question {i + 1}</h6>
                        <div className="card-body d-flex justify-content-between align-items-start">
  <div
    className="flex-grow-1"
    onClick={() => goToLevel(level.levelNumber, i)}
  >
    {/* <h6 className="card-title">Question {i + 1}</h6> */}
    {/* <p className="card-text">{q.Text}</p> */}
  </div>

  {/* QR ICON */}
  <button
  className="btn btn-light btn-sm ms-3"
  onClick={(e) => {
    e.stopPropagation(); // prevent card click
    navigate(`/QrGenerate/${level.levelNumber}/${i}`);
  }}
>
  <img
    src="/qr_symbol.jpg"
    alt="Generate QR"
    className="img-fluid"
    style={{ width: "32px", height: "32px" }}
  />
</button>

</div>

                        <p className="card-text">{q.Text}</p>

                        {/* Render file with distinct width & height */}
                        {q.file && (() => {
                          const fileUrl = q.file.startsWith("http")
                            ? q.file
                            : `/uploads/${q.file}`;

                          // Image
                          if (fileUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
                            return (
                              <img
                                src={fileUrl}
                                alt="Attachment"
                                style={{
                                  width: "400px",
                                  height: "250px",
                                  objectFit: "cover",
                                  marginBottom: "10px",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            );
                          }

                          // Video
                          if (fileUrl.match(/\.(mp4|webm|ogg)$/i)) {
                            return (
                              <video
                                src={fileUrl}
                                controls
                                style={{
                                  width: "400px",
                                  height: "250px",
                                  marginBottom: "10px",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            );
                          }

                          // Other files
                          return (
                            <p>
                              <a href={fileUrl} target="_blank" rel="noreferrer">
                                📎 View Attachment
                              </a>
                            </p>
                          );
                        })()}

                        <span className="badge bg-success">Answer: {q.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default checkAuth(TrailList);
