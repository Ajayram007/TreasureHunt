// QRScanner.js
import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { checkAuth } from "../auth/checkAuth";

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

            // ✅ Parse JSON QR containing only { answer: "..." }
            try {
              parsed = JSON.parse(decodedText);
            } catch (err) {
              parsed = { answer: decodedText.trim() };
              
            }

            if (!parsed.answer) {
              onScan({ error: "Invalid QR! Missing 'answer' field." });
              return;
            }

            // ✅ Trim extra whitespace
            parsed.answer = parsed.answer.trim();

            stopScanner();
            onScan(parsed); // parsed contains only { answer: "..." }
          }
        );

        isRunning.current = true;
      } catch (err) {
        console.error("Scan error:", err);
        onScan({ error: "Camera access error" });
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

export default checkAuth(QRScanner);
