"use client";

import React, { useState, useEffect, useRef } from "react";

// Types
interface TranscriptLine {
  speaker: "caller" | "user";
  text: string;
  timestamp: string;
}

interface RiskResult {
  risk_score: number;
  risk_label: string;
  explanation: string;
  triggers: string[];
}

export default function Home() {
  const [view, setView] = useState<"dashboard" | "active" | "summary">("dashboard");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [risk, setRisk] = useState<RiskResult>({
    risk_score: 0,
    risk_label: "SAFE",
    explanation: "No scam patterns detected yet. Stay alert and never share OTP or PIN.",
    triggers: []
  });
  const [callId] = useState(() => Math.random().toString(36).substring(7));

  const ws = useRef<WebSocket | null>(null);
  const recognition = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // WebSocket Setup
  useEffect(() => {
    if (view === "active") {
      const socket = new WebSocket(`ws://localhost:8000/ws/call/${callId}`);

      socket.onopen = () => console.log("VoiceShield Protection Connected");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "risk_update") {
          setRisk(data.payload);
        }
      };

      ws.current = socket;
      return () => socket.close();
    }
  }, [view, callId]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = false;
    recognition.current.lang = "en-IN";

    recognition.current.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript;
      handleNewUtterance("user", text);
    };

    recognition.current.start();
  };

  const handleNewUtterance = (speaker: "caller" | "user", text: string) => {
    const newLine: TranscriptLine = { speaker, text, timestamp: new Date().toISOString() };
    setTranscript(prev => [...prev, newLine]);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "transcript", payload: newLine }));
    }
  };

  const startProtection = () => {
    setView("active");
    setTranscript([]);
    setRisk({
      risk_score: 0,
      risk_label: "SAFE",
      explanation: "No scam patterns detected yet. Stay alert and never share OTP or PIN.",
      triggers: []
    });
    startRecording();
  };

  const stopProtection = (showSummary = true) => {
    recognition.current?.stop();
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: "end_call" }));
    }
    if (showSummary) setView("summary");
    else setView("dashboard");
  };

  // Demo Simulation
  const simulateScam = () => {
    const script = [
      "Hello, I am calling from HDFC Bank verification department.",
      "Your account has been flagged for suspicious activity and will be blocked.",
      "I have sent an OTP to your registered mobile number. Please read it out to me.",
      "Also, I need your UPI PIN to sync your account with our secure server."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= script.length || view !== "active") {
        clearInterval(interval);
        return;
      }
      handleNewUtterance("caller", script[i]);
      i++;
    }, 4000);
  };

  const getRiskColor = () => {
    if (risk.risk_label === "HIGH") return "danger";
    if (risk.risk_label === "MEDIUM") return "suspicious";
    return "safe";
  };

  const getSuggestions = () => {
    if (risk.risk_label === "HIGH") return [
      "Hang up the call immediately.",
      "Do NOT share any OTP, UPI PIN, CVV, passwords, or card numbers.",
      "If they say they are from your bank, call the official bank number from the bank’s website."
    ];
    if (risk.risk_label === "MEDIUM" || risk.risk_score > 30) return [
      "Ask the caller to prove their identity.",
      "Avoid sharing personal or banking information.",
      "If you feel uncomfortable, end the call."
    ];
    return [
      "No scam patterns detected yet.",
      "Still, never share OTP or PIN with anyone."
    ];
  };

  return (
    <main className="animate-fade-in">
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "white" }}>VoiceShield</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Secure Call Defender</p>
      </header>

      {/* View: Dashboard */}
      {view === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 150px)" }}>
          <div className="card">
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Stay safe from scam calls</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Turn on protection, then take your calls on speaker. VoiceShield will listen and warn you if something looks dangerous.
            </p>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
            <div className="status-badge status-off">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ccc" }} />
              Protection is currently OFF
            </div>

            <button className="btn btn-primary" onClick={startProtection}>
              🛡️ Start Secure Call
            </button>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "80%" }}>
              After you tap this, keep your phone call on speaker so VoiceShield can analyze the conversation.
            </p>
          </div>

          <footer style={{ marginTop: "auto", textAlign: "center", paddingBottom: "1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              We never place calls. Use your normal phone app to make or receive calls while VoiceShield protects you.
            </p>
          </footer>
        </div>
      )}

      {/* View: Active Protection */}
      {view === "active" && (
        <div className="animate-fade-in">
          <div className="card" style={{ textAlign: "center", padding: "1rem" }}>
            <div className="status-badge status-on">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--safe-color)", animation: "pulse 1.5s infinite" }} />
              Live Call Protection is ON
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              VoiceShield is analyzing what the caller says in real time.
            </p>
          </div>

          <div className={`risk-indicator ${getRiskColor()}`}>
            <div style={{ fontSize: "2.5rem" }}>
              {risk.risk_label === "HIGH" ? "⚠️" : risk.risk_label === "MEDIUM" ? "🟡" : "🛡️"}
            </div>
            <div style={{ fontWeight: "700", marginTop: "0.5rem" }}>
              {risk.risk_label === "HIGH" ? "Danger: Possible Scam" : risk.risk_label === "MEDIUM" ? "Suspicious call" : "Safe so far"}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "white", fontSize: "0.95rem", fontWeight: "500" }}>{risk.explanation}</p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>AI Suggestions</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {getSuggestions().map((s, i) => (
                <li key={i} style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  <span>•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.8rem" }}>What we’re hearing</h3>
            <div style={{ maxHeight: "150px", overflowY: "auto", padding: "0.5rem" }}>
              {transcript.map((line, idx) => (
                <div key={idx} className={`transcript-line ${line.speaker === "caller" ? "transcript-caller" : "transcript-user"}`}>
                  <span style={{ fontWeight: "bold", fontSize: "0.75rem", marginRight: "0.5rem" }}>
                    {line.speaker === "caller" ? "Caller:" : "You:"}
                  </span>
                  {line.text}
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <button className="btn btn-danger" onClick={() => {
              if (window.confirm("Are you sure you want to stop protection?")) stopProtection(true);
            }}>
              End Call & Stop Protection
            </button>
            <button className="btn btn-outline" onClick={() => stopProtection(false)}>
              Stop Protection
            </button>
            <button className="btn btn-outline" style={{ fontSize: "0.8rem", borderStyle: "dashed" }} onClick={simulateScam}>
              (Testing) Simulate Scammer
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "2rem" }}>
            Listening… keep your call on speaker for best detection.
          </p>
        </div>
      )}

      {/* View: Summary */}
      {view === "summary" && (
        <div className="animate-fade-in">
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📱</div>
            <h2 style={{ marginBottom: "0.5rem" }}>Call Summary</h2>
            <div style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: risk.risk_label === "HIGH" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              color: risk.risk_label === "HIGH" ? "var(--danger-color)" : "var(--safe-color)",
              fontWeight: "700",
              marginBottom: "1rem"
            }}>
              Last call result: {risk.risk_label} RISK
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {risk.explanation}
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>What should I do now?</h3>
            <ul style={{ paddingLeft: "1.2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <li style={{ marginBottom: "0.8rem" }}>Do not call back unknown numbers that ask for money or OTP.</li>
              <li style={{ marginBottom: "0.8rem" }}>If you shared any details, contact your bank immediately and secure your account.</li>
              <li>Report this number if it repeated fraudulent behavior.</li>
            </ul>
          </div>

          <button className="btn btn-primary" onClick={() => setView("dashboard")}>
            Return to Dashboard
          </button>
        </div>
      )}

      <footer style={{ marginTop: "2rem", textAlign: "center", paddingBottom: "2rem" }}>
        <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", maxWidth: "80%", margin: "0 auto" }}>
          Note: VoiceShield analyzes audio around your device. For protecting phone calls, use it on your mobile and keep the call on speaker.
        </p>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
}
