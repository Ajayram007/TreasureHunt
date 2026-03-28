// import React, { useState } from "react";
// import axios from "axios";
// import "../styles/trail_component.css";
// import Navbar from "../navbar";
// import { useNavigate } from "react-router-dom";
// import { checkAuth } from "../auth/checkAuth";

// const TrailCreate = () => {
// const [form, setForm] = useState({
// levelNumber: "",
// place: "",
// answer: "",
// image: null
// });

// const [message, setMessage] = useState(""); // string message
// const [levelData, setLevelData] = useState(null); // backend level object
// const [loading, setLoading] = useState(false);
// const navigate = useNavigate();

// const handleChange = (e) => {
// if (e.target.name === "image") {
// setForm({ ...form, image: e.target.files[0] });
// } else {
// setForm({ ...form, [e.target.name]: e.target.value });
// }
// };

// const handleSubmit = async (e) => {
// e.preventDefault();
// setLoading(true);
// setMessage("");
// setLevelData(null);


// try {
//   const token = localStorage.getItem("token");

//   const formData = new FormData();
//   formData.append("levelNumber", Number(form.levelNumber));
//   formData.append("place", form.place.trim());
//   formData.append("answer", form.answer.trim());
//   if (form.image) formData.append("image", form.image);

//   const res = await axios.post("/users/trailCreate", formData, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "multipart/form-data"
//     }
//   });

//   // Separate string message and returned level object
//   setMessage(res.data.message || "Trail created successfully");
//   setLevelData(res.data.level || null);

//   // Reset form
//   setForm({ levelNumber: "", place: "", answer: "", image: null });

//   // Optional redirect
//   setTimeout(() => {
//     navigate("/trailRetrieve");
//   }, 1000);

// } catch (error) {
//   setMessage(error.response?.data?.message || "Error creating trail");
// } finally {
//   setLoading(false);
// }


// };

// return ( <div className="trail-wrapper"> <Navbar />


//   <div className="trail-card">
//     <h2>Create Trail Level</h2>

//     {message && <p className="trail-message">{message}</p>}

//     <form className="trail-form" onSubmit={handleSubmit}>
//       <label>Level Number (1–5)</label>
//       <input
//         type="number"
//         name="levelNumber"
//         value={form.levelNumber}
//         onChange={handleChange}
//         min="1"
//         max="5"
//         required
//       />

//       <label>question</label>
//       <input
//         type="text"
//         name="place"
//         value={form.place}
//         onChange={handleChange}
//         placeholder="Enter question"
        
//       />

//       <label>Answer</label>
//       <input
//         type="text"
//         name="answer"
//         value={form.answer}
//         onChange={handleChange}
//         placeholder="Enter answer"
//         required
//       />

//       <label>Upload Image (optional)</label>
//       <input
//         type="file"
//         name="image"
//         accept="image/*"
//         onChange={handleChange}
//       />

//       <button type="submit" disabled={loading}>
//         {loading ? "Submitting..." : "Add Trail"}
//       </button>
//     </form>

//     {/* Display level data safely */}
//     {levelData && (
//       <div className="level-preview">
//         <h3>Level {levelData.levelNumber} Places</h3>
//         {levelData.places.map(p => (
//           <div key={p._id} className="place-card">
//             <p><strong>Name:</strong> {p.name}</p>
//             <p><strong>Answer:</strong> {p.answer}</p>
//             {p.image && (
//               <img
//                 src={p.image}
//                 alt={p.name}
//                 style={{ maxWidth: "200px", display: "block", marginTop: "5px" }}
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// </div>


// );
// };

// export default checkAuth(TrailCreate);
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";
import Navbar from "../navbar";

const TrailCreate = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    levelNumber: "",
    Text: "",
    answer: "",
    questionIndex: "",
    file: null
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("levelNumber", form.levelNumber);
      formData.append("Text", form.Text);
      formData.append("answer", form.answer);

      if (form.questionIndex !== "") {
        formData.append("questionIndex", Number(form.questionIndex));
      }

      if (form.file) {
        formData.append("file", form.file); // ✅ must match backend
      }

      await axios.post("/trail/trailCreate", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      navigate("/trailRetrieve");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!form.file) return null;

    const fileUrl = URL.createObjectURL(form.file);

    if (/\.(jpg|jpeg|png|gif)$/i.test(form.file.name)) {
      return <img src={fileUrl} alt="preview" className="img-fluid rounded" style={{ maxHeight: 200 }} />;
    }

    if (/\.(mp4|webm|ogg)$/i.test(form.file.name)) {
      return <video src={fileUrl} controls style={{ maxHeight: 200 }} />;
    }

    return (
      <a href={fileUrl} target="_blank" rel="noreferrer">
        📎 Preview File
      </a>
    );
  };

  return (
    <div className="container mt-5">
      <Navbar />
      <div className="card shadow mt-5">
        <div className="card-body">
          <h4 className="mb-4">➕ Create Trail Question</h4>

          {message && <div className="alert alert-danger">{message}</div>}

          <form onSubmit={handleSubmit}>
            {/* Level Number */}
            <div className="mb-3">
              <label className="form-label">Level Number (1–6)</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="6"
                value={form.levelNumber}
                onChange={(e) =>
                  setForm({ ...form, levelNumber: e.target.value })
                }
                required
              />
            </div>

            {/* Question Index */}
            <div className="mb-3">
              <label className="form-label">
                Insert at Question Index (optional)
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

            {/* Question Text */}
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

            {/* File Upload */}
            <div className="mb-3">
              <label className="form-label">Attachment (optional)</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files[0] })
                }
              />
            </div>

            {/* Preview */}
            {form.file && (
              <div className="mb-3 text-center">
                <label className="form-label">Preview</label>
                {renderPreview()}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "💾 Create Question"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default checkAuth(TrailCreate);
