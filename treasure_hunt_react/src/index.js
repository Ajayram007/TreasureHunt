import React from "react";
import axios from "axios";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter } from "react-router-dom";

// Base URL for the Backend API. 
// Note: Backend (Render) CORS is configured to allow localhost:3001 and all *.vercel.app domains.
// Production Frontend: https://treasure-hunt-six-olive.vercel.app
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);