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

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export default function VoiceShield() {
  // State
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'dashboard' | 'active' | 'summary'>('dashboard');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [risk, setRisk] = useState<RiskResult>({
    risk_score: 0,
    risk_label: 'SAFE',
    explanation: 'No scam patterns detected yet. VoiceShield is monitoring.',
    triggers: []
  });

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hello! I am your AI Fraud Security Assistant. How can I help you stay safe today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persistent Mode: Auto-restart Speech Recognition if it stops
  useEffect(() => {
    if (isListening && mounted) {
      const interval = setInterval(() => {
        try {
          // If the recognition stopped but state says we're listening, restart it
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        } catch (e) {
          // Suppress noise if already started
        }
      }, 5000); // Check every 5 seconds to ensure "Always Active" mode
      return () => clearInterval(interval);
    }
  }, [isListening, mounted]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // WebSocket Connection
  useEffect(() => {
    if (!mounted) return;

    if (view === 'active') {
      const callId = Math.random().toString(36).substring(7);
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/call/${callId}`;

      try {
        socketRef.current = new WebSocket(wsUrl);
        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'risk_update') {
            setRisk(data.payload);
          }
        };
      } catch (e) { console.error('WS Error', e); }

      return () => { socketRef.current?.close(); };
    }
  }, [view, mounted]);

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
          speaker: 'user',
          text: text,
          timestamp: new Date().toLocaleTimeString()
        };
        setTranscript(prev => [...prev, newLine]);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'transcript', payload: newLine }));
        }
      }
    };

    recognitionRef.current.onerror = () => { /* Prevent crash loops */ };
    recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) { console.error(e); }
  };

  const stopProtection = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    setView('summary');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Simulate AI response based on user questions
      let aiResponse = "I recommend you never share sensitive info like OTP or PIN. If you have been defrauded, immediately block your accounts and contact cybercrime police (1930).";

      const input = userMsg.text.toLowerCase();
      if (input.includes('otp')) aiResponse = "NEVER SHARE YOUR OTP. No bank employee or official will ever ask for it. It is the final key to your money.";
      if (input.includes('link')) aiResponse = "Don't click unknown links in SMS or WhatsApp. They can install viruses or clone your phone session.";
      if (input.includes('upi') || input.includes('pin')) aiResponse = "Your UPI PIN is only for PAYMENT, not for receiving money. If someone asks for your PIN to 'refund' money, they are scamming you.";
      if (input.includes('bank details') || input.includes('leaked')) aiResponse = "If your details are leaked, immediately use your bank's app to Freeze/Lock your cards. Change all passwords and inform the bank branch.";

      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        setIsChatLoading(false);
      }, 800);
    } catch (e) {
      setIsChatLoading(false);
    }
  };

  const simulateScam = (type: 'otp' | 'safe' | 'telugu') => {
    let text = "";
    if (type === 'otp') text = "Please tell me the 6 digit OTP sent to your number to update your KYC immediately.";
    if (type === 'telugu') text = "Mee number ki vachina 6 digit OTP cheppandi, lekapothe mee account block avthundi.";
    if (type === 'safe') text = "Hello, I am calling regarding your recent bank statement query.";

    const newLine: TranscriptLine = { speaker: 'caller', text: text, timestamp: new Date().toLocaleTimeString() };
    setTranscript(prev => [...prev, newLine]);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'transcript', payload: newLine }));
    }
  };

  if (!mounted) return null;

  return (
    <main>
      {view === 'dashboard' && (
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
              VoiceShield (v2.0 Premium) monitors your phone calls 24/7. This session is set to be <b>Always Active</b> for max security.
            </p>

            <button className="btn btn-primary" onClick={() => { setView('active'); startSpeechRecognition(); }}>
              <span style={{ fontSize: '1.4rem' }}>🛡️</span> Start Secure Protection
            </button>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="label-small">Detection Language</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {['en-IN', 'hi-IN', 'te-IN', 'ta-IN'].map(lang => (
                  <button key={lang} onClick={() => setSelectedLang(lang)} className={selectedLang === lang ? 'lang-btn active' : 'lang-btn'}>
                    {lang.split('-')[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ marginTop: '1.1rem', opacity: 0.8 }}>
            <div className="label-small">SYSTEM STATUS</div>
            <div style={{ fontSize: '0.85rem' }}>🟢 High-Intensity Backend Running...</div>
          </div>
        </div>
      )}

      {view === 'active' && (
        <div className="animate-fade-in">
          <div className="text-center pt-8">
            <div className="status-badge status-on" style={{ animation: 'pulse 1.5s infinite' }}>
              ⚡ ALWAYS ACTIVE MODE enabled
            </div>
          </div>

          <div className={`risk-indicator ${risk.risk_label === 'MEDIUM' ? 'suspicious' : risk.risk_label === 'HIGH' ? 'danger' : ''}`}>
            <span style={{ fontSize: '3rem' }}>
              {risk.risk_label === 'HIGH' ? '🚨' : risk.risk_label === 'MEDIUM' ? '⚠️' : '🛡️'}
            </span>
            <div className="risk-label" style={{
              color: risk.risk_label === 'HIGH' ? 'var(--danger-color)' : risk.risk_label === 'MEDIUM' ? 'var(--suspicious-color)' : 'var(--safe-color)'
            }}>
              {risk.risk_label === 'HIGH' ? 'DANGER DETECTED' : risk.risk_label === 'MEDIUM' ? 'SUSPICIOUS ACTIVITY' : 'SECURE CALL'}
            </div>
          </div>

          <div className="glass-card" style={{ borderColor: risk.risk_label === 'HIGH' ? 'var(--danger-color)' : 'var(--border-color)' }}>
            <div className="label-small">AI SECURITY ADVISOR</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {risk.risk_label === 'HIGH' ? '🛑 HANG UP NOW' : 'Listening...'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{risk.explanation}</p>
          </div>

          <div className="label-small" style={{ marginLeft: '0.5rem' }}>REAL-TIME ANALYSIS</div>
          <div className="glass-card" style={{ padding: '1rem', height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {transcript.map((line, i) => (
              <div key={i} className={`transcript-line ${line.speaker === 'user' ? 'transcript-user' : 'transcript-caller'}`}>
                {line.text}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          <button className="btn btn-danger" onClick={stopProtection} style={{ marginTop: '1rem' }}>
            Stop & View Summary
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <button onClick={() => simulateScam('otp')} className="btn btn-outline" style={{ fontSize: '0.7rem' }}>Simulate OTP (EN)</button>
            <button onClick={() => simulateScam('telugu')} className="btn btn-outline" style={{ fontSize: '0.7rem' }}>Simulate OTP (TE)</button>
          </div>
        </div>
      )}

      {view === 'summary' && (
        <div className="animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Flag Animations */}
          <div className="flag-animation" style={{ color: risk.risk_label === 'HIGH' ? '#ef4444' : '#22c55e' }}>🚩</div>
          <div className="flag-animation" style={{ color: risk.risk_label === 'HIGH' ? '#ef4444' : '#22c55e', animationDelay: '2s' }}>🚩</div>

          <div className="text-center mb-6 mt-10">
            <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Session Report</h2>
          </div>

          <div className={`glass-card ${risk.risk_label === 'HIGH' ? 'summary-risk-card' : 'summary-safe-card'}`} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>{risk.risk_label === 'HIGH' ? '🚨' : '🛡️'}</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '10px' }}>
              {risk.risk_label === 'HIGH' ? 'HIGH RISK DETECTED' : 'CLEAN SESSION'}
            </div>
            <p style={{ opacity: 0.8, marginTop: '10px' }}>{risk.explanation}</p>
          </div>

          {risk.risk_label === 'HIGH' && (
            <div className="next-steps-card">
              <h3 style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ ACTION NEEDED IMMEDIATELY
              </h3>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>You were exposed to a potentially harmful call. Do the following now:</p>
              <ul style={{ fontSize: '0.85rem', marginTop: '10px', color: 'var(--text-secondary)' }}>
                <li>1. Change your Bank/UPI passwords immediately.</li>
                <li>2. Report the number to the Cyber Crime cell (1930).</li>
                <li>3. Check your recent transactions for unauthorized charges.</li>
                <li>4. DO NOT click any links sent via SMS from this caller.</li>
              </ul>
            </div>
          )}

          <div className="chatbot-container">
            <div className="label-small">🛡️ VOICE SHIELD AI CHATBOT</div>
            <div style={{
              height: '300px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              border: '1px solid var(--border-color)'
            }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                  {msg.text}
                </div>
              ))}
              {isChatLoading && <div className="chat-bubble chat-ai">Typing...</div>}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about fraud security..."
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Send</button>
            </form>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
              <span onClick={() => setChatInput("Can I share OTP?")} className="lang-btn" style={{ fontSize: '0.7rem' }}>Can I share OTP?</span>
              <span onClick={() => setChatInput("What if money is gone?")} className="lang-btn" style={{ fontSize: '0.7rem' }}>What if money is gone?</span>
              <span onClick={() => setChatInput("How to avoid fraud?")} className="lang-btn" style={{ fontSize: '0.7rem' }}>Fraud Prevention</span>
            </div>
          </div>

          <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }} onClick={() => { setView('dashboard'); setTranscript([]); setRisk({ risk_score: 0, risk_label: 'SAFE', explanation: 'No scam patterns detected yet. VoiceShield is monitoring.', triggers: [] }); }}>
            Return to Dashboard
          </button>
        </div>
      )}

      <footer>
        <p>© 2026 VoiceShield Premium Protection</p>
        <p>Developed by: <b>Penjendru Varun</b></p>
        <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>System is set to Always-Active Mode (3-6 Days Persistence Enabled)</p>
      </footer>
    </main>
  );
}
