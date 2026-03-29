import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FluidGlass from "./FluidGlass";

const Home = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      
      {/* 3D Background Layer */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <FluidGlass 
          mode="lens"
          scrollEnabled={false}
          lensProps={{
            scale: { mobile: 0.012, tablet: 0.016, desktop: 0.02 },
            ior: 1.8,
            thickness: 100,
            transmission: 1,
            roughness: 0,
            chromaticAberration: 0.1,
            anisotropy: 0.01  
          }}
        />
      </div>

      {/* Foreground Content */}
      <div 
        className="container w-100 h-100 d-flex justify-content-center align-items-end" 
        style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}
      >
        <div 
          className="card shadow-lg text-center p-4 border-0" 
          style={{ 
            width: "100%", 
            maxWidth: "420px", 
            background: "rgba(255, 255, 255, 0.4)", 
            backdropFilter: "blur(20px)",
            pointerEvents: "auto",
            marginBottom: isMobile ? "30px" : "100px"
          }}
        >
          {/* Logo */}
          <img
            src="icons.png"
            alt="Treasure Hunt"
            className="mx-auto mb-3"
            style={{ width: "200px", height: "160px", objectFit: "contain" }}
          />

          <h2 className="mb-4 fw-bold text-dark">Treasure Hunt</h2>

          {/* Buttons */}
          <div className="d-grid gap-3">
            <button
              className="btn btn-primary btn-lg shadow"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>

            <button
              className="btn btn-light btn-lg shadow"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
