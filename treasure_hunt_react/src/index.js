import React from "react";
import axios from "axios";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter } from "react-router-dom";

// 🌐 Base URL for the Backend API.
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  // Fallback for production (Vercel) when env var is missing
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://treasurehunt-backend-j9hb.onrender.com";
  }

  return "http://localhost:3000";
};

axios.defaults.baseURL = getBaseURL();
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);