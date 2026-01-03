'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/ui/welcome-screen';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, MessageSquare, PhoneIncoming, AlertTriangle } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'welcome' | 'monitoring' | 'active' | 'summary'>('welcome');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [risk, setRisk] = useState<RiskResult>({
    risk_score: 0,
    risk_label: 'SAFE',
    explanation: 'VoiceShield is monitoring for threats...',
    triggers: []
  });

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hello! I am your AI Fraud Advisor. I am here to answer your questions about security. How can I help?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persistent Monitoring Logic
  useEffect(() => {
    if (view === 'monitoring' && mounted) {
      if (!isListening) {
        startSpeechRecognition();
      }
    }
  }, [view, isListening, mounted]);

  // WebSocket Connection
  useEffect(() => {
    if (!mounted) return;

    // Always keep socket ready if in monitoring or active
    if (view === 'monitoring' || view === 'active') {
      const callId = "persist_" + Math.random().toString(36).substring(7);
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/call/${callId}`;

      try {
        socketRef.current = new WebSocket(wsUrl);
        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'risk_update') {
            const newRisk = data.payload;
            setRisk(newRisk);

            // If risk is detected, automatically transition to Active View (Page 3)
            if (newRisk.risk_label === 'HIGH' || newRisk.risk_label === 'MEDIUM') {
              setView('active');
            }
          }
        };
        socketRef.current.onclose = () => {
          if (view === 'monitoring' || view === 'active') {
            // Attempt reconnect
            setTimeout(() => setMounted(m => !m), 3000);
          }
        };
      } catch (e) { console.error(e); }

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

        // Send to backend
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'transcript', payload: newLine }));
        }

        // If we hear "hello" or activity while in monitoring, we can potentially trigger 'active' 
        // but for now we follow the risk-based trigger.
      }
    };

    recognitionRef.current.onend = () => {
      if (view === 'monitoring' || view === 'active') {
        try { recognitionRef.current.start(); } catch (e) { }
      }
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) { console.error(e); }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');

    let aiResponse = "As your advisor, I suggest being extremely careful with callers asking for info. Please report this to 1930.";

    if (userMsg.includes('otp')) aiResponse = "NEVER SHARE YOUR OTP. Banks will never ask for it. It is for your eyes only.";
    if (userMsg.includes('upi') || userMsg.includes('pin')) aiResponse = "UPI PIN is only used to SEND money, never to RECEIVE. If someone asks for your PIN to 'refund', they are scammers.";
    if (userMsg.includes('leak') || userMsg.includes('money gone')) aiResponse = "If money is gone, immediately call 1930 (National Cyber Crime Helpline) and freeze your bank cards via your official bank app.";
    if (userMsg.includes('fraud detector')) aiResponse = "VoiceShield uses advanced AI to detect tone, urgency, and keywords to identify scammers before you share anything.";
    if (userMsg.includes('bank man') || userMsg.includes('sized')) aiResponse = "Real bank managers will never call you to ask for PINs or passwords. They will always ask you to visit the branch for such issues.";
    if (userMsg.includes('link')) aiResponse = "NEVER click unknown links in messages. They can clone your SIM or access your mobile banking apps.";
    if (userMsg.includes('hi') || userMsg.includes('hello')) aiResponse = "Welcome to VoiceShield! How can I help you regarding call security today?";
    if (userMsg.includes('bye')) aiResponse = "Stay safe! Remember, VoiceShield is here to protect you from scammers. Goodbye!";

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 500);
  };

  const simulateCallTrigger = () => {
    setView('active');
    // Force a "safe" state initially
    setRisk({ risk_score: 5, risk_label: 'SAFE', explanation: 'Call detected. Monitoring conversation...', triggers: [] });
  };

  const simulateScamTrigger = () => {
    setView('active');
    setRisk({
      risk_score: 95,
      risk_label: 'HIGH',
      explanation: 'CRITICAL THREAT: Caller is asking for OTP/Sensitive Access.',
      triggers: ['REQUEST_OTP']
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <AnimatePresence mode="wait">

        {/* --- PAGE 1: WELCOME --- */}
        {view === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen w-full">
            <WelcomeScreen
              imageUrl="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop"
              title={<>Welcome to <span className="text-primary italic">VoiceShield</span> AI</>}
              description="Protecting you from fraud calls in real-time. Always active, always secure. Developed by Penjendru Varun."
              buttonText="Start Secure Protection"
              onButtonClick={() => setView('monitoring')}
            />
          </motion.div>
        )}

        {/* --- PAGE 2: MONITORING (6 DAYS PERSISTENCE) --- */}
        {view === 'monitoring' && (
          <motion.div key="monitoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-screen p-8 text-center bg-slate-950">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <Shield className="w-24 h-24 text-primary relative z-10" />
            </div>

            <h2 className="text-2xl font-black mb-4 tracking-tighter">AI MONITORING ACTIVE</h2>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
              VoiceShield is listening for incoming calls. This session will remain active for up to 6 days. Keep your phone on speakerphone when talking.
            </p>

            <div className="flex gap-4 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Awaiting Audio Input</span>

            {/* Hidden triggers for demo */}
            <div className="fixed bottom-12 flex gap-2">
              <Button variant="ghost" className="text-[10px] opacity-20 hover:opacity-100" onClick={simulateCallTrigger}>Test Call</Button>
              <Button variant="ghost" className="text-[10px] opacity-20 hover:opacity-100" onClick={simulateScamTrigger}>Test Scam</Button>
            </div>
          </motion.div>
        )}

        {/* --- PAGE 3: ACTIVE FLAG INDICATOR (THE FULL PAGE ALERT) --- */}
        {view === 'active' && (
          <motion.div
            key="active"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-500 ${risk.risk_label === 'HIGH' ? 'bg-red-600' : 'bg-green-500'}`}
          >
            {/* LARGE FLAG ANIMATION */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
              <div className="moving-flag text-9xl">🚩</div>
              <div className="moving-flag text-9xl [animation-delay:1.5s] mt-48">🚩</div>
            </div>

            <div className="text-9xl mb-8 drop-shadow-2xl">
              {risk.risk_label === 'HIGH' ? '🚩' : '🚩'}
            </div>

            <h1 className="text-6xl font-black text-white mb-4 italic drop-shadow-lg text-center">
              {risk.risk_label === 'HIGH' ? 'RED FLAG DETECTED' : 'SAFE CONVERSATION'}
            </h1>

            {risk.risk_label === 'HIGH' ? (
              <div className="flex flex-col items-center">
                <img
                  src="https://www.freeiconspng.com/uploads/skull-and-bones-icon-22.png"
                  alt="Danger"
                  className="w-48 h-48 danger-animate mb-8 invert"
                />
                <div className="bg-black/40 p-6 rounded-3xl backdrop-blur-xl border border-white/20 text-center max-w-md">
                  <p className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">🚨 HANG UP IMMEDIATELY 🚨</p>
                  <p className="text-white/80 text-sm leading-tight">{risk.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-xl border border-white/10 text-center">
                <ShieldCheck className="w-20 h-20 text-white mx-auto mb-4" />
                <p className="text-white font-bold">MONITORING FOR SCAMS...</p>
              </div>
            )}

            <Button
              onClick={() => setView('summary')}
              className="mt-12 bg-white text-black hover:bg-slate-200 h-14 px-10 rounded-2xl font-black text-lg shadow-2xl"
            >
              END CALL & REPORT
            </Button>
          </motion.div>
        )}

        {/* --- PAGE 4: SUMMARY & CHATBOT --- */}
        {view === 'summary' && (
          <motion.div key="summary" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-h-screen bg-slate-950 p-6 pb-24">
            <div className="text-center mb-8">
              <div className="w-16 h-1 w-12 bg-primary mx-auto mb-4 rounded-full"></div>
              <h2 className="text-3xl font-black tracking-tighter">SECURITY REPORT</h2>
              <p className="text-slate-500 text-sm font-bold">Developed by Penjendru Varun</p>
            </div>

            <div className={`p-8 rounded-[40px] border-2 text-center mb-8 ${risk.risk_label === 'HIGH' ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
              <span className="text-5xl mb-4 block">{risk.risk_label === 'HIGH' ? '🚫' : '✅'}</span>
              <h3 className="text-2xl font-black">{risk.risk_label === 'HIGH' ? 'FRUD ATTEMPT STOPPED' : 'NO THREATS FOUND'}</h3>
              <p className="text-sm mt-2 opacity-70">{risk.explanation}</p>
            </div>

            {/* Action Recommendation */}
            {risk.risk_label === 'HIGH' && (
              <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl mb-8">
                <h4 className="text-red-500 font-black mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> WHAT SHOULD I DO NOW?
                </h4>
                <ul className="space-y-3 text-sm font-semibold text-slate-300">
                  <li className="flex gap-2"><span>1.</span> <span>Block the phone number immediately.</span></li>
                  <li className="flex gap-2"><span>2.</span> <span>Change your UPI PIN and Bank Passwords.</span></li>
                  <li className="flex gap-2"><span>3.</span> <span>Call 1930 to report this fraud attempt.</span></li>
                  <li className="flex gap-2"><span>4.</span> <span>NEVER share details if caller mentions "KYC Suspended".</span></li>
                </ul>
              </div>
            )}

            {/* AI CHATBOT SECTION */}
            <div className="chatbot-area mt-12">
              <div className="flex items-center gap-2 mb-4 px-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Fraud Advisory AI</h3>
              </div>

              <div className="bg-black/60 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="h-[400px] overflow-y-auto p-6 flex flex-col gap-4">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white self-end ml-12 rounded-tr-none' : 'bg-slate-800 text-slate-100 self-start mr-12 rounded-tl-none'}`}
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-slate-900 border-none rounded-2xl px-5 h-12 flex-1 text-sm focus:ring-2 ring-primary transition-all outline-none"
                    placeholder="Ask about security..."
                  />
                  <Button type="submit" className="h-12 w-12 p-0 rounded-2xl">
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </form>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button onClick={() => setChatInput("Can I share OTP?")} className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-full font-bold hover:bg-primary transition-colors">OTP Safety?</button>
                <button onClick={() => setChatInput("UPI PIN rules?")} className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-full font-bold hover:bg-primary transition-colors">UPI PIN rules?</button>
                <button onClick={() => setChatInput("How to avoid fraud?")} className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-full font-bold hover:bg-primary transition-colors">Prevention tips?</button>
              </div>
            </div>

            <footer className="mt-16 text-center opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">VoiceShield Security Protocol v2.5</p>
              <p className="text-[10px]">© 2026 • Penjendru Varun</p>
            </footer>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[80%]">
              <Button onClick={() => setView('welcome')} variant="outline" className="w-full bg-black/40 backdrop-blur-md rounded-2xl h-14 font-black">RESET SYSTEM</Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
