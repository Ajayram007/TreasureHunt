// QRScanner.js
import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const isRunning = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader");

        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            if (!isRunning.current) return;
            console.log("QR RAW =", decodedText);

            let parsed = null;

            // CASE 1: JSON QR
            try {
              parsed = JSON.parse(decodedText);
            } catch (_) {
              // CASE 2: levelNumber:place
              if (decodedText.includes(":")) {
                const [levelNumber, place] = decodedText.split(":");
                parsed = { levelNumber, place };
              }
            }

            if (!parsed) {
              onScan({ error: "Invalid format" });
              return;
            }

            stopScanner();
            onScan(parsed);
          }
        );

        isRunning.current = true;
      } catch (err) {
        console.error("Scan error:", err);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current && isRunning.current) {
        try {
          await scannerRef.current.stop();
          console.log("Scanner stopped");
        } catch (err) {
          console.warn("Stop skipped:", err.message);
        }
        isRunning.current = false;
      }
    };

    startScanner();

    return () => stopScanner();
  }, [onScan]);

  return <div id="qr-reader" style={{ width: "100%" }} />;
};

export default QRScanner;
