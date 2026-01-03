"use client";

import React from "react";

interface RiskResult {
    risk_score: number;
    risk_label: string;
    explanation: string;
    triggers: string[];
}

interface Props {
    risk: RiskResult | null;
    isElderlyMode?: boolean;
}

export default function VoiceShieldPanel({ risk, isElderlyMode }: Props) {
    if (!risk) return null;

    const getStatusColor = (label: string) => {
        switch (label.toUpperCase()) {
            case "SAFE": return "var(--success-color)";
            case "LOW": return "var(--success-color)";
            case "MEDIUM": return "var(--warning-color)";
            case "HIGH": return "var(--danger-color)";
            default: return "var(--text-secondary)";
        }
    };

    const color = getStatusColor(risk.risk_label);

    return (
        <div className="glass fadeIn" style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: isElderlyMode ? "400px" : "320px",
            padding: "1.5rem",
            zIndex: 1000,
            boxShadow: `0 8px 32px ${color}33`,
            border: `1px solid ${color}66`
        }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", gap: "10px" }}>
                <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 10px ${color}`
                }} />
                <h3 style={{ fontSize: isElderlyMode ? "1.5rem" : "1.1rem" }}>VoiceShield Protection</h3>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>RISK LEVEL</div>
                <div style={{ fontSize: isElderlyMode ? "2rem" : "1.4rem", fontWeight: "bold", color }}>
                    {risk.risk_label} ({risk.risk_score}%)
                </div>
            </div>

            <p style={{
                fontSize: isElderlyMode ? "1.2rem" : "0.95rem",
                lineHeight: "1.5",
                marginBottom: "1rem",
                color: "var(--text-primary)"
            }}>
                {risk.explanation}
            </p>

            {risk.triggers.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {risk.triggers.map(tag => (
                        <span key={tag} style={{
                            fontSize: "0.7rem",
                            padding: "4px 8px",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "4px",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-color)"
                        }}>
                            {tag.replace(/_/g, " ")}
                        </span>
                    ))}
                </div>
            )}

            {risk.risk_label === "HIGH" && (
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid var(--danger-color)",
                    borderRadius: "12px",
                    textAlign: "center"
                }}>
                    <strong style={{ color: "var(--danger-color)", display: "block", marginBottom: "0.5rem", fontSize: isElderlyMode ? "1.4rem" : "1rem" }}>
                        POSSIBLE SCAM DETECTED
                    </strong>
                    <button
                        onClick={() => window.location.reload()} // Simplified disconnect
                        style={{
                            background: "var(--danger-color)",
                            color: "white",
                            border: "none",
                            padding: "0.8rem 1.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            width: "100%",
                            fontSize: isElderlyMode ? "1.2rem" : "0.9rem"
                        }}
                    >
                        DISCONNECT NOW
                    </button>
                </div>
            )}
        </div>
    );
}
