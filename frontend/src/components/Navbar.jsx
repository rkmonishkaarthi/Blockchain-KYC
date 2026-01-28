import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();

    const styles = {
        nav: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 40px",
            background: "rgba(15, 23, 42, 0.8)", // Semi-transparent dark bg
            backdropFilter: "blur(12px)", // Glassmorphism
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            position: "sticky",
            top: 0,
            zIndex: 100,
        },
        logo: {
            fontSize: "20px",
            fontWeight: "800",
            background: "linear-gradient(90deg, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
            textDecoration: "none",
        },
        links: {
            display: "flex",
            gap: "8px",
        },
        link: (active) => ({
            textDecoration: "none",
            color: active ? "#fff" : "#94a3b8",
            fontSize: "14px",
            fontWeight: "600",
            padding: "8px 16px",
            borderRadius: "20px",
            background: active ? "rgba(255, 255, 255, 0.1)" : "transparent",
            transition: "all 0.2s ease",
        }),
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>
                ⚡ DocChain
            </Link>
            <div style={styles.links}>
                <Link to="/" style={styles.link(location.pathname === "/")}>
                    Home
                </Link>
                <Link to="/add" style={styles.link(location.pathname === "/add")}>
                    Issue Certificate
                </Link>
                <Link to="/verify" style={styles.link(location.pathname === "/verify")}>
                    Verify
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
