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

  const fileUrl = URL.createObjectURL(file); // creates local preview URL

  // Optional: clean up old blob URLs when component unmounts or file changes
  // (you can also do this in useEffect cleanup)

  if (file.type.startsWith('image/')) {
    return (
      <img
        src={fileUrl}
        alt="Preview"
        className="img-fluid rounded shadow-sm"
        style={{ maxHeight: '300px', objectFit: 'contain' }}
        onLoad={() => URL.revokeObjectURL(fileUrl)} // optional cleanup
      />
    );
  }

  if (file.type.startsWith('video/')) {
    return (
      <video
        src={fileUrl}
        controls
        className="rounded shadow-sm"
        style={{ maxHeight: '400px', width: '100%' }}
        onLoadedData={() => URL.revokeObjectURL(fileUrl)}
      />
    );
  }

  // PDF or other documents
  if (file.type === 'application/pdf') {
    return (
      <div className="border rounded p-3 bg-light text-center">
        <p className="mb-2">PDF Preview not supported inline.</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm"
        >
          Open PDF ({file.name})
        </a>
      </div>
    );
  }

  // Fallback for any other file type
  return (
    <div className="alert alert-info mb-0">
      Selected file: <strong>{file.name}</strong><br />
      <small>Type: {file.type || 'unknown'} • Size: {(file.size / 1024).toFixed(1)} KB</small>
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
                  required
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
