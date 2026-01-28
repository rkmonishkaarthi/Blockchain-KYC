import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "80px 20px",
      fontFamily: "'Inter', sans-serif",
      textAlign: "center",
    },
    heroTitle: {
      fontSize: "64px",
      fontWeight: "800",
      letterSpacing: "-1px",
      lineHeight: "1.1",
      marginBottom: "24px",
      background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    heroSubtitle: {
      fontSize: "20px",
      color: "#94a3b8",
      maxWidth: "600px",
      margin: "0 auto 40px",
      lineHeight: "1.6",
    },
    ctaGroup: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      marginBottom: "80px",
    },
    btnPrimary: {
      padding: "16px 32px",
      borderRadius: "30px",
      background: "#3b82f6",
      color: "white",
      fontWeight: "600",
      textDecoration: "none",
      fontSize: "16px",
      boxShadow: "0 10px 25px -10px rgba(59, 130, 246, 0.5)",
      transition: "transform 0.2s",
    },
    btnSecondary: {
      padding: "16px 32px",
      borderRadius: "30px",
      background: "rgba(30, 41, 59, 0.5)",
      color: "#f8fafc",
      fontWeight: "600",
      textDecoration: "none",
      fontSize: "16px",
      border: "1px solid #334155",
      transition: "background 0.2s",
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "30px",
      marginTop: "60px",
      textAlign: "left",
    },
    card: {
      background: "#1e293b",
      padding: "30px",
      borderRadius: "20px",
      border: "1px solid #334155",
      transition: "transform 0.2s",
    },
    cardIcon: {
      fontSize: "40px",
      marginBottom: "20px",
      display: "block",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#f8fafc",
      marginBottom: "10px",
    },
    cardText: {
      color: "#94a3b8",
      lineHeight: "1.6",
    },
  };

  return (
    <div style={styles.container}>
      <div style={{ animation: "fadeIn 1s ease" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "20px" }}>
          Blockchain Powered Security
        </div>
        <h1 style={styles.heroTitle}>
          The Future of <br />
          <span style={{ color: "#3b82f6", WebkitTextFillColor: "#3b82f6" }}>Document Integrity</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Issue, store, and verify tamper-proof credentials directly on the Ethereum blockchain. Secure. Immutable. Forever.
        </p>

        <div style={styles.ctaGroup}>
          <Link to="/add" style={styles.btnPrimary}>Start Issuing</Link>
          <Link to="/verify" style={styles.btnSecondary}>Verify Doc</Link>
        </div>
      </div>

      <div style={styles.featureGrid}>
        <div style={styles.card}>
          <span style={styles.cardIcon}>🛡️</span>
          <h3 style={styles.cardTitle}>Tamper-Proof</h3>
          <p style={styles.cardText}>
            Once hashed on the blockchain, records are immutable. No more fake certificates or forged documents.
          </p>
        </div>
        <div style={styles.card}>
          <span style={styles.cardIcon}>⚡</span>
          <h3 style={styles.cardTitle}>Instant Verification</h3>
          <p style={styles.cardText}>
            Verify any document in milliseconds by scanning a QR code or dragging and dropping the file.
          </p>
        </div>
        <div style={styles.card}>
          <span style={styles.cardIcon}>🌍</span>
          <h3 style={styles.cardTitle}>Global Standard</h3>
          <p style={styles.cardText}>
            Built on Ethereum, recognized worldwide. A decentralized source of truth for all your credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
