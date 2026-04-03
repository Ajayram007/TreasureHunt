import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const TrailUpdate = () => {
  const { levelNumber, questionIndex } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Text: "",
    answer: "",
    file: null,          // new file
    existingFile: null   // existing filename
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  
  // 🔹 Fetch existing question
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `/trail/trail/${levelNumber}/${questionIndex}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const q = res.data.question;

        setForm({
          Text: q.Text || "",
          answer: q.answer || "",
          file: null,
          existingFile: q.file || null
        });

        setLoading(false);
      } catch {
        setMessage("Failed to load question");
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [levelNumber, questionIndex]);

  // ❌ Remove existing file (UI only)
  const removeExistingFile = () => {
    setForm((prev) => ({
      ...prev,
      existingFile: null
    }));
  };

  // 💾 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("Text", form.Text);
      formData.append("answer", form.answer);

      // Tell backend to delete old file if user removed it
      if (!form.existingFile) {
        formData.append("removeFile", "true");
      }

      // Upload new file (auto replaces old)
      if (form.file) {
        formData.append("file", form.file); // ✅ MUST be "file"
      }

      await axios.put(
        `/trail/trailUpdate/${levelNumber}/${questionIndex}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      navigate(-1);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  // 🖼 Media Preview
  const renderMedia = (file) => {
    if (!file) return null;

    let fileUrl = "";
    let isNewFile = file instanceof File;

    if (isNewFile) {
      fileUrl = URL.createObjectURL(file);
    } else {
      // Existing file from backend
      const backendUrl = axios.defaults.baseURL || "http://localhost:3000";
      fileUrl = file.startsWith("http")
        ? file
        : `${backendUrl}/uploads/${file}`;
    }

    // Image
    if (isNewFile ? file.type.startsWith("image/") : fileUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
      return (
        <img
          src={fileUrl}
          alt="Preview"
          className="img-fluid rounded shadow-sm"
          style={{ maxHeight: "300px", objectFit: "contain" }}
          onLoad={() => isNewFile && URL.revokeObjectURL(fileUrl)}
        />
      );
    }

    // Video
    if (isNewFile ? file.type.startsWith("video/") : fileUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video
          src={fileUrl}
          controls
          className="rounded shadow-sm"
          style={{ maxHeight: "400px", width: "100%" }}
          onLoadedData={() => isNewFile && URL.revokeObjectURL(fileUrl)}
        />
      );
    }

    // Fallback for documents or unknown types
    return (
      <div className="border rounded p-3 bg-light text-center">
        <p className="mb-2">Preview not supported for this file type.</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm"
        >
          View File {isNewFile ? `(${file.name})` : ""}
        </a>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="card shadow">
        <div className="card-body">
          <h4 className="mb-4">
            Update Level {levelNumber} – Question {Number(questionIndex) + 1}
          </h4>

          {message && <div className="alert alert-danger">{message}</div>}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Question */}
              <div className="mb-3">
                <label className="form-label">Question</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.Text}
                  onChange={(e) =>
                    setForm({ ...form, Text: e.target.value })
                  }
                  
                />
              </div>
             {/* Question Index */}
            <div className="mb-3">
              <label className="form-label">
                Insert at Question Index [0-4](optional)
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Leave empty to append"
                value={form.questionIndex}
                onChange={(e) =>
                  setForm({ ...form, questionIndex: e.target.value })
                }
              />
            </div>
              {/* Answer */}
              <div className="mb-3">
                <label className="form-label">Answer</label>
                <input
                  className="form-control"
                  value={form.answer}
                  onChange={(e) =>
                    setForm({ ...form, answer: e.target.value })
                  }
                  required
                />
              </div>

              {/* Existing File */}
              {form.existingFile && (
                <div className="mb-3 text-center">
                  {renderMedia(form.existingFile)}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger mt-2"
                    onClick={removeExistingFile}
                  >
                    ❌ Remove
                  </button>
                </div>
              )}

              {/* Upload New File */}
              <div className="mb-3">
                <label className="form-label">Replace File</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    setForm({ ...form, file: e.target.files[0] })
                  }
                />
              </div>

              {/* File Preview */}
              {form.file && (
  <div className="mb-4 text-center border-top pt-3">
    <label className="form-label fw-bold">New File Preview</label>
    <div className="mt-2">
      {renderMedia(form.file)}
    </div>
    <small className="text-muted">
      {form.file.name} • {(form.file.size / 1024 / 1024).toFixed(2)} MB
    </small>
  </div>
)}


              <button type="submit" className="btn btn-primary">
                💾 Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default checkAuth(TrailUpdate);
