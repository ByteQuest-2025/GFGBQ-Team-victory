'use client';

import { useState, useEffect, useRef } from 'react';

// --- Types ---
interface RiskResult {
  risk_score: number;
  risk_label: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  triggers: string[];
}

interface TranscriptLine {
  speaker: 'user' | 'caller';
  text: string;
  timestamp: string;
}

export default function VoiceShield() {
  // State
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'dashboard' | 'active' | 'summary'>('dashboard');

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [risk, setRisk] = useState<RiskResult>({
    risk_score: 0,
    risk_label: 'SAFE',
    explanation: 'No scam patterns detected yet. VoiceShield is monitoring.',
    triggers: []
  });

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // WebSocket Connection
  useEffect(() => {
    if (view === 'active') {
      const callId = Math.random().toString(36).substring(7);
      const wsUrl = `ws://${window.location.hostname}:8000/ws/call/${callId}`;
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'risk_update') {
          setRisk(data.payload);
        }
      };

      socketRef.current.onclose = () => console.log('WebSocket closed');

      return () => {
        socketRef.current?.close();
      };
    }
  }, [view]);

  // Speech Recognition Control
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = selectedLang;

    recognitionRef.current.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const text = result[0].transcript;
        const newLine: TranscriptLine = {
          speaker: 'user', // We assume mic primarily hears user, speakerphone gets both
          text: text,
          timestamp: new Date().toLocaleTimeString()
        };

        setTranscript(prev => [...prev, newLine]);

        // Send to backend for analysis
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'transcript',
            payload: newLine
          }));
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'no-speech') {
        // Quietly restart if it stops
        try { recognitionRef.current.start(); } catch (e) { }
      }
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopProtection = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setView('summary');
  };

  /* --- View Components --- */

  const Dashboard = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-8 mt-12">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>
          Voice<span style={{ color: 'var(--primary-color)' }}>Shield</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Secure Call Defender</p>
      </div>

      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Protect</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          VoiceShield monitors your phone calls in real-time. Simply start protection and keep your call on speakerphone.
        </p>

        <button className="btn btn-primary" onClick={() => { setView('active'); startSpeechRecognition(); }}>
          <span style={{ fontSize: '1.4rem' }}>🛡️</span> Start Secure Call
        </button>

        <div style={{ marginTop: '1.5rem' }}>
          <div className="label-small">Select Call Language</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {[
              { label: 'English/Mix', val: 'en-IN' },
              { label: 'Hindi', val: 'hi-IN' },
              { label: 'Telugu', val: 'te-IN' },
              { label: 'Tamil', val: 'ta-IN' }
            ].map(lang => (
              <button
                key={lang.val}
                onClick={() => setSelectedLang(lang.val)}
                style={{
                  padding: '10px 15px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: selectedLang === lang.val ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div className="label-small">Status</div>
        <div className="status-badge status-off">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }}></div>
          Protection is OFF
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          We never place or record your calls. We only analyze audio locally via your microphone when protection is active.
        </p>
      </div>
    </div>
  );

  const ActiveProtection = () => (
    <div className="animate-fade-in">
      <div className="text-center pt-8">
        <div className="status-badge status-on">
          <div className="audio-wave">
            <div className="audio-bar"></div>
            <div className="audio-bar"></div>
            <div className="audio-bar"></div>
          </div>
          Live Protection Active
        </div>
      </div>

      <div className={`risk-indicator ${risk.risk_label === 'MEDIUM' ? 'suspicious' : risk.risk_label === 'HIGH' ? 'danger' : ''}`}>
        <span style={{ fontSize: '3rem' }}>
          {risk.risk_label === 'HIGH' ? '🚨' : risk.risk_label === 'MEDIUM' ? '⚠️' : '🛡️'}
        </span>
        <div className="risk-label" style={{
          color: risk.risk_label === 'HIGH' ? 'var(--danger-color)' : risk.risk_label === 'MEDIUM' ? 'var(--suspicious-color)' : 'var(--safe-color)'
        }}>
          {risk.risk_label === 'HIGH' ? 'DANGER' : risk.risk_label === 'MEDIUM' ? 'SUSPICIOUS' : 'SECURE'}
        </div>
      </div>

      <div className="glass-card" style={{ borderColor: risk.risk_label === 'HIGH' ? 'var(--danger-color)' : 'var(--border-color)' }}>
        <div className="label-small">AI ADVISOR</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {risk.risk_label === 'HIGH' ? 'HANG UP IMMEDIATELY' : 'Stay Alert'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{risk.explanation}</p>

        {risk.risk_label === 'HIGH' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger-color)', fontSize: '0.85rem', fontWeight: 700 }}>
            • Do NOT share OTP or PIN<br />
            • Scammer is asking for financial info
          </div>
        )}
      </div>

      <div className="label-small" style={{ marginLeft: '0.5rem' }}>LIVE TRANSCRIPT</div>
      <div className="glass-card" style={{ padding: '1rem', height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
        <div ref={transcriptEndRef} />
        {transcript.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>Listening for conversation...</p>
        ) : (
          transcript.map((line, i) => (
            <div key={i} className={`transcript-line ${line.speaker === 'user' ? 'transcript-user' : 'transcript-caller'}`}>
              <div className="label-small" style={{ fontSize: '0.65rem', marginBottom: '0' }}>{line.timestamp}</div>
              {line.text}
            </div>
          )).reverse()
        )}
      </div>

      <button className="btn btn-danger" onClick={stopProtection} style={{ marginTop: '1rem' }}>
        End Session
      </button>

      {/* Demo Simulation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        <button onClick={() => simulateScam('otp')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '8px' }}>Simulate OTP Ask (EN)</button>
        <button onClick={() => simulateScam('telugu')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '8px' }}>Simulate OTP Ask (TE)</button>
        <button onClick={() => simulateScam('safe')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '8px' }}>Simulate Safe</button>
      </div>
    </div>
  );

  const Summary = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-8 mt-12">
        <div style={{ fontSize: '4rem' }}>📊</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Session Summary</h2>
      </div>

      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div className="label-small">Last Call Status</div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: risk.risk_label === 'HIGH' ? 'var(--danger-color)' : 'var(--safe-color)',
          marginBottom: '1rem'
        }}>
          {risk.risk_label === 'HIGH' ? 'HIGH RISK DETECTED' : 'CLEAN SESSION'}
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          {risk.risk_label === 'HIGH'
            ? 'We detected scam patterns related to OTP/Financial requests during this call.'
            : 'No major scam threats were identified during this session.'}
        </p>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Security Recommendations</h3>
        <ul style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Never share OTP, PIN, or CVV over a call.</li>
          <li style={{ marginBottom: '0.5rem' }}>Banks never ask for remote access to your phone.</li>
          <li>If suspicious, block the number and report to 1930.</li>
        </ul>
      </div>

      <button className="btn btn-primary" onClick={() => { setTranscript([]); setRisk({ risk_score: 0, risk_label: 'SAFE', explanation: 'No scam patterns detected yet.', triggers: [] }); setView('dashboard'); }}>
        Return to Home
      </button>
    </div>
  );

  // Simulation Helper
  const simulateScam = (type: 'otp' | 'safe' | 'telugu') => {
    let text = "";
    if (type === 'otp') text = "Please tell me the 6 digit OTP sent to your number to update your KYC immediately.";
    if (type === 'telugu') text = "Mee number ki vachina 6 digit OTP cheppandi, lekapothe mee account block avthundi.";
    if (type === 'safe') text = "Hello, I am calling regarding your recent bank statement query.";

    const newLine: TranscriptLine = {
      speaker: 'caller',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };
    setTranscript(prev => [...prev, newLine]);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'transcript', payload: newLine }));
    }
  };

  if (!mounted) return null;

  return (
    <main>
      {view === 'dashboard' && <Dashboard />}
      {view === 'active' && <ActiveProtection />}
      {view === 'summary' && <Summary />}
    </main>
  );
}
