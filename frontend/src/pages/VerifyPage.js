import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import DocVerify from "../contracts/DocVerify.json";
import { QRCodeCanvas } from "qrcode.react";
import HolographicCard from "../components/HolographicCard";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const hardhatChainId = "0x7A69";

export default function VerifyPage() {
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState("Ready to Scan");
  // const [loading, setLoading] = useState(false); // Unused in VerifyPage
  const [scanning, setScanning] = useState(false); // Visual scanning effect
  const [isDragOver, setIsDragOver] = useState(false);

  // Advanced Mode (Manual)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualHash, setManualHash] = useState("");

  const certificateRef = useRef();

  // --- LOGIC ---
  const switchToLocalhost = async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hardhatChainId }],
      });
      return true;
    } catch { return false; }
  };

  const getSigner = async () => {
    if (!window.ethereum) return null;
    await switchToLocalhost();
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider.getSigner();
  };

  const verifyHash = async (hash) => {
    setScanning(true);
    setStatus("Scanning Blockchain Ledger...");

    // Simulate scan delay for effect
    await new Promise(r => setTimeout(r, 1500));

    try {
      const signer = await getSigner();
      if (!signer) {
        setScanning(false);
        return;
      }
      const contract = new ethers.Contract(contractAddress, DocVerify.abi, signer);

      const isValid = await contract.verifyDocument(hash);

      if (isValid) {
        const data = await contract.getStudentDetails(hash);
        setStudent({
          hash,
          fullName: data[0],
          dob: data[1],
          gender: data[2],
          physicalAddress: data[3],
          phone: data[4],
          email: data[5],
          aadhaar: data[6],
          pan: data[7],
          passport: data[8],
          drivingLicense: data[9],
          voterId: data[10],
          photoUrl: data[11], // New Field
          verifiedAt: new Date().toISOString()
        });
        setStatus("Verified Successfully");
      } else {
        setStudent(null);
        alert("❌ IDENTITY NOT FOUND ON BLOCKCHAIN ❌");
        setStatus("Verification Failed");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error Connecting");
    } finally {
      setScanning(false);
    }
  };

  // --- FILE HANDLING ---
  const handleFile = async (file) => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hash = "0x" + Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    verifyHash(hash);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // --- PDF GENERATION ---
  const generateSmartCardPDF = () => {
    try {
      // ID-1 Card Size: 85.60 × 53.98 mm
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54]
      });

      // 1. Card Background (Dark Gradient Simulation)
      // jsPDF doesn't support gradients easily, so we use a solid dark color
      doc.setFillColor(15, 23, 42); // #0f172a (Dark Slate)
      doc.rect(0, 0, 85.6, 54, "F");

      // 2. Decorative Header Bar
      doc.setFillColor(33, 41, 60); // Lighter slate
      doc.rect(0, 0, 85.6, 12, "F");

      // 3. Header Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // #94a3b8
      doc.text("KYC VERIFIED STATUS", 4, 8);

      // Verified Badge (Green Rect + Text)
      doc.setFillColor(16, 185, 129); // #10b981
      doc.roundedRect(58, 4, 24, 5, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text("KYC CONFIRMED", 70, 7.5, { align: "center" });

      // 4. Content Content
      doc.setTextColor(255, 255, 255);

      // Name
      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text("NAME", 26, 20);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(student.fullName, 26, 25);

      // DOB & Gender Row
      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text("DOB", 26, 32);
      doc.text("GENDER", 55, 32);

      doc.setFontSize(7);
      doc.setTextColor(226, 232, 240);
      doc.text(student.dob, 26, 36);
      doc.text(student.gender, 55, 36);

      // Hash (Tiny monospace)
      doc.setFontSize(4);
      doc.setTextColor(100, 116, 139);
      doc.text("DOCUMENT HASH", 26, 44);
      doc.setFont("courier", "normal");
      doc.text(student.hash, 26, 47, { maxWidth: 55 });

      // 5. Photo or QR
      if (student.photoUrl) {
        doc.addImage(student.photoUrl, "JPEG", 3, 16, 20, 20);
        // Add a thin border around photo in PDF
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.2);
        doc.rect(3, 16, 20, 20);
      } else {
        const qrCanvas = document.getElementById("pdf-qr-source");
        if (qrCanvas) {
          const qrData = qrCanvas.toDataURL("image/png");
          // Place QR on the left
          doc.addImage(qrData, "PNG", 3, 16, 20, 20);
        }
      }

      // 6. Footer Strip
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4);
      doc.setTextColor(71, 85, 105);
      doc.text("IMMUTABLE • SECURE • DECENTRALIZED", 42.8, 52, { align: "center" });

      doc.save(`SmartID-${student.fullName}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF");
    }
  };

  // --- STYLES ---
  const styles = {
    page: {
      minHeight: "100vh",
      background: "var(--bg-dark)",
      color: "var(--text-primary)",
      fontFamily: "'Inter', sans-serif",
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    scannerZone: {
      width: "100%",
      maxWidth: "600px",
      height: "300px",
      border: isDragOver ? "3px dashed var(--success)" : "2px dashed #334155",
      borderRadius: "20px",
      background: isDragOver ? "rgba(16,185,129,0.1)" : "var(--bg-card)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s",
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
    },
    scanLine: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: "var(--success)",
      boxShadow: "0 0 15px var(--success)",
      animation: "scan 1.5s infinite linear",
      display: scanning ? "block" : "none",
    },
    icon: {
      fontSize: "60px",
      marginBottom: "20px",
      opacity: 0.8,
    },
    text: {
      fontSize: "18px",
      color: "#94a3b8",
    },
    advancedToggle: {
      marginTop: "30px",
      color: "#64748b",
      cursor: "pointer",
      fontSize: "14px",
      textDecoration: "underline",
    },
    advancedPanel: {
      marginTop: "20px",
      background: "var(--bg-card)",
      padding: "20px",
      borderRadius: "10px",
      width: "100%",
      maxWidth: "600px",
    },
    input: {
      width: "95%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #334155",
      background: "var(--bg-dark)",
      color: "var(--text-primary)",
      marginBottom: "10px",
    },
    btn: {
      padding: "10px 20px",
      background: "var(--accent-blue)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    resultContainer: {
      marginTop: "40px",
      animation: "fadeIn 1s ease",
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <h1 style={{ marginBottom: "10px", textAlign: "center", background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        KYC Identity Check
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "40px" }}>
        Drop any document to instantly verify its authenticity on the blockchain.
      </p>

      {/* SCANNER ZONE */}
      {!student && (
        <div
          style={styles.scannerZone}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div style={styles.scanLine} />

          {scanning ? (
            <div style={{ textAlign: "center" }}>
              <div style={styles.icon}>📡</div>
              <div style={{ color: "#10b981", fontWeight: "bold" }}>Scanning Ledger...</div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={styles.icon}>📄</div>
              <div style={styles.text}>Drag & Drop ID Card Here</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "10px" }}>(or click to browse)</div>
            </div>
          )}

          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* RESULTS (HOLOGRAPHIC CARD) */}
      {student && (
        <div style={styles.resultContainer} ref={certificateRef}>
          <HolographicCard student={student} />

          {/* Hidden QR for PDF Generation */}
          <div style={{ display: "none" }}>
            <QRCodeCanvas id="pdf-qr-source" value={student.hash} size={200} />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => { setStudent(null); setStatus("Ready"); }}
              style={{ ...styles.btn, background: "#334155", marginRight: "10px" }}
            >
              Scan Another
            </button>
            <button
              onClick={generateSmartCardPDF}
              style={{ ...styles.btn, marginRight: "10px" }}
            >
              Download PDF
            </button>
          </div>
        </div>
      )}



      {/* CSS for Scan Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ADVANCED TOGGLE */}
      {!student && (
        <>
          <div style={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Hide Advanced Options" : "Advanced Hash Tools"}
          </div>

          {showAdvanced && (
            <div style={styles.advancedPanel}>
              <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Manual Hash Check</h3>
              <input
                style={styles.input}
                placeholder="Paste 0x..."
                value={manualHash}
                onChange={e => setManualHash(e.target.value)}
              />
              <button style={styles.btn} onClick={() => verifyHash(manualHash)}>Check Hash</button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
