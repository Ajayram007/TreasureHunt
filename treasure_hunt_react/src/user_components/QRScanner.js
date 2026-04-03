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
            // ✅ Parse QR: handle JSON { answer: "..." } or Raw "..."
            try {
              const res = JSON.parse(decodedText);
              // Use res if it's an object with an 'answer' property
              if (res && typeof res === 'object' && res.answer) {
                parsed = res;
              } else {
                // Otherwise treat raw text as the answer (e.g. "3" or "A")
                parsed = { answer: String(decodedText).trim() };
              }
            } catch (err) {
              parsed = { answer: String(decodedText).trim() };
            }

            if (!parsed.answer) {
              onScan({ error: "Invalid QR! Missing value." });
              return;
            }

            // ✅ Trim extra whitespace
            parsed.answer = parsed.answer.trim();

            // ✅ No need to call stopScanner() here. 
            // Setting scanning: false in parent will unmount this component,
            // triggering the useEffect cleanup which calls stopScanner().
            onScan(parsed); 
          }
        );

        isRunning.current = true;
      } catch (err) {
        console.error("Scan error:", err);
        onScan({ error: "Camera access error" });
      }
    };

    const stopScanner = async () => {
      // ✅ Check if it's already stopping or stopped to prevent race conditions
      if (scannerRef.current && isRunning.current) {
        isRunning.current = false; // Set this immediately
        try {
          await scannerRef.current.stop();
          console.log("Scanner stopped");
        } catch (err) {
          // Gracefully catch the "removeChild" error which happens if the DOM node is already gone
          const msg = err?.message || err?.toString() || "";
          if (msg.includes("removeChild") || msg.includes("not a child")) {
             console.log("Scanner cleaned up (DOM node already removed)");
          } else {
             console.warn("Stop skipped:", msg);
          }
        }
        scannerRef.current = null; // Clear the ref
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  return <div id="qr-reader" style={{ width: "100%" }} />;
};

export default checkAuth(QRScanner);
