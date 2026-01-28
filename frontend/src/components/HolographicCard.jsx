import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const HolographicCard = ({ student }) => {
    const cardRef = useRef(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 15 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotate({ x: rotateX, y: rotateY });

        // Calculate glare position (opposite to mouse)
        setGlare({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            opacity: 1,
        });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
        setGlare((prev) => ({ ...prev, opacity: 0 }));
    };

    // Modern ID Card Style - Premium & Readability Update
    const styles = {
        container: {
            perspective: "1200px",
            display: "flex",
            justifyContent: "center",
            margin: "40px auto",
        },
        card: {
            width: "450px", // Slightly larger
            height: "285px", // ID-1 aspect ratio approx
            position: "relative",
            borderRadius: "24px",
            // Deeper, richer gradient
            background: "linear-gradient(135deg, #020617 0%, #172554 50%, #1e1e24 100%)",
            color: "white",
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: "transform 0.1s ease-out",
            boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            overflow: "hidden",
            fontFamily: "'Inter', sans-serif",
            userSelect: "none",
        },
        // The "Holo" Gradient Overlay
        hologram: {
            position: "absolute",
            inset: 0,
            background: `
        linear-gradient(
          115deg, 
          transparent 0%, 
          rgba(56, 189, 248, 0.1) 30%, 
          rgba(232, 121, 249, 0.1) 60%, 
          transparent 100%
        )
      `,
            opacity: 0.6,
            pointerEvents: "none",
            mixBlendMode: "color-dodge",
            zIndex: 2,
        },
        // Mouse-reactive Glare
        glare: {
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4), transparent 40%)`,
            opacity: glare.opacity,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
            zIndex: 3,
            mixBlendMode: "overlay",
        },
        // Card Content Layout
        content: {
            position: "relative",
            zIndex: 4,
            padding: "32px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box", // Ensure padding doesn't affect width
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px", // More spacing
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "15px",
        },
        title: {
            fontSize: "12px",
            fontWeight: "800",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        verifiedBadge: {
            background: "rgba(16, 185, 129, 0.2)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
        },
        body: {
            display: "flex",
            gap: "30px",
            alignItems: "flex-start",
        },
        qrContainer: {
            background: "white",
            padding: "8px",
            borderRadius: "12px",
            width: "100px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
        },
        details: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "15px",
        },
        nameGroup: {
            marginBottom: "5px",
        },
        label: {
            fontSize: "11px",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: "600",
            marginBottom: "4px",
        },
        value: {
            fontSize: "15px",
            fontWeight: "600",
            color: "#f8fafc",
            letterSpacing: "0.2px",
        },
        largeValue: {
            fontSize: "24px",
            fontWeight: "700",
            color: "white",
            letterSpacing: "-0.5px",
            lineHeight: "1.2",
            // Gradient text for name
            background: "linear-gradient(to right, #ffffff, #e2e8f0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
        },
        row: {
            display: "flex",
            gap: "40px",
        },
        hashGroup: {
            marginTop: "auto",
        },
        hashValue: {
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            color: "#64748b",
            background: "rgba(0,0,0,0.2)",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block",
        },
        footer: {
            marginTop: "auto",
            paddingTop: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        footerText: {
            fontSize: "9px",
            fontWeight: "600",
            color: "#475569",
            letterSpacing: "1px",
            textTransform: "uppercase",
        },
    };

    return (
        <div style={styles.container}>
            <div
                ref={cardRef}
                style={styles.card}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Effects */}
                <div className="holo-overlay" style={styles.hologram} data-html2canvas-ignore="true" />
                <div className="glare-overlay" style={styles.glare} data-html2canvas-ignore="true" />

                {/* Content */}
                <div style={styles.content}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.title}>
                            <span style={{ fontSize: "16px" }}>🛡️</span> Secure Identity
                        </div>
                        <div style={styles.verifiedBadge}>
                            <span>✓</span> Verified On-Chain
                        </div>
                    </div>

                    {/* Body */}
                    <div style={styles.body}>
                        <div style={{ ...styles.qrContainer, padding: 0, overflow: "hidden" }}>
                            {student.photoUrl ? (
                                <img src={student.photoUrl} alt="ID Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <QRCodeCanvas value={student.hash} size={84} />
                            )}
                        </div>

                        <div style={styles.details}>
                            <div style={styles.nameGroup}>
                                <div style={styles.label}>Identity Name</div>
                                <div style={styles.largeValue}>{student.fullName}</div>
                            </div>

                            <div style={styles.row}>
                                <div>
                                    <div style={styles.label}>Date of Birth</div>
                                    <div style={styles.value}>{student.dob}</div>
                                </div>
                                <div>
                                    <div style={styles.label}>Gender</div>
                                    <div style={styles.value}>{student.gender}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Hash */}
                    <div style={styles.footer}>
                        <div style={styles.hashGroup}>
                            <div style={{ ...styles.label, fontSize: "9px", marginBottom: "2px" }}>Document Checksum (SHA-256)</div>
                            <div style={styles.hashValue}>
                                {student.hash.slice(0, 14)}...{student.hash.slice(-14)}
                            </div>
                        </div>
                        <div style={styles.footerText}>
                            Official Smart ID
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolographicCard;
