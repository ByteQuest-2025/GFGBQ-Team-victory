'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/ui/welcome-screen';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, MessageSquare, Settings, Globe, AlertTriangle, X } from 'lucide-react';

// --- Translations ---
type Language = 'en' | 'te' | 'hi' | 'ta';

const translations = {
  en: {
    welcome_title: "Welcome to VoiceShield AI",
    welcome_desc: "Protecting you from fraud calls in real-time. Always active, always secure. Developed by Penjendru Varun.",
    start_btn: "Start Secure Protection",
    status_monitoring: "AI MONITORING ACTIVE",
    monitoring_desc: "VoiceShield is listening for incoming calls. This session will remain active for up to 6 days. Keep your phone on speakerphone when talking.",
    awaiting: "AWAITING AUDIO INPUT",
    red_flag: "RED FLAG DETECTED",
    safe_call: "SAFE CONVERSATION",
    hang_up: "🚨 HANG UP IMMEDIATELY 🚨",
    report: "END CALL & REPORT",
    summary: "SECURITY REPORT",
    action_needed: "ACTION NEEDED IMMEDIATELY",
    chatbot_title: "FRAUD ADVISORY AI",
    reset: "RESET SYSTEM",
    developed_by: "Developed by: Penjendru Varun"
  },
  te: {
    welcome_title: "వాయిస్ షీల్డ్ (VoiceShield) AI కి స్వాగతం",
    welcome_desc: "నిజ-సమయంలో మిమ్మల్ని మోసపూరిత కాల్‌ల నుండి రక్షిస్తుంది. ఎల్లప్పుడూ సక్రియంగా, ఎల్లప్పుడూ సురక్షితంగా ఉంటుంది. పెన్జేండ్రు వరుణ్ రూపొందించారు.",
    start_btn: "సురక్షిత రక్షణను ప్రారంభించండి",
    status_monitoring: "AI మానిటరింగ్ సక్రియంగా ఉంది",
    monitoring_desc: "వాయిస్ షీల్డ్ ఇన్‌కమింగ్ కాల్‌ల కోసం వేచి ఉంది. ఈ సెషన్ 6 రోజుల వరకు సక్రియంగా ఉంటుంది. మాట్లాడేటప్పుడు మీ ఫోన్‌ను స్పీకర్‌ఫోన్‌లో ఉంచండి.",
    awaiting: "ఆడియో ఇన్‌పుట్ కోసం నిరీక్షణ",
    red_flag: "రెడ్ ఫ్లాగ్ (ప్రమాదం) గుర్తించబడింది",
    safe_call: "సురక్షితమైన సంభాషణ",
    hang_up: "🚨 వెంటనే ఫోన్ పెట్టేయండి 🚨",
    report: "కాల్ ముగించి నివేదించండి",
    summary: "భద్రతా నివేదిక",
    action_needed: "వెంటనే తీసుకోవలసిన చర్యలు",
    chatbot_title: "ఫ్రాడ్ అడ్వైజరీ AI",
    reset: "సిస్టమ్‌ను రీసెట్ చేయండి",
    developed_by: "రూపొందించినవారు: పెన్జేండ్రు వరుణ్"
  },
  hi: {
    welcome_title: "VoiceShield AI में आपका स्वागत है",
    welcome_desc: "वास्तविक समय में आपको धोखाधड़ी वाली कॉल से बचाना। हमेशा सक्रिय, हमेशा सुरक्षित। पेनजेंड्रू वरुण द्वारा विकसित।",
    start_btn: "सुरक्षित सुरक्षा शुरू करें",
    status_monitoring: "AI निगरानी सक्रिय है",
    monitoring_desc: "VoiceShield इनकमिंग कॉल सुन रहा है। यह सत्र 6 दिनों तक सक्रिय रहेगा। बात करते समय अपने फोन को स्पीकरफोन पर रखें।",
    awaiting: "ऑडियो इनपुट की प्रतीक्षा है",
    red_flag: "खतरे का संकेत मिला",
    safe_call: "सुरक्षित बातचीत",
    hang_up: "🚨 तुरंत फोन काट दें 🚨",
    report: "कॉल समाप्त करें और रिपोर्ट करें",
    summary: "सुरक्षा रिपोर्ट",
    action_needed: "तत्काल कार्रवाई की आवश्यकता है",
    chatbot_title: "धोखाधड़ी सलाहकार AI",
    reset: "सिस्टम रीसेट करें",
    developed_by: "विकसित: पेनजेंड्रू वरुण"
  },
  ta: {
    welcome_title: "VoiceShield AI-க்கு உங்களை வரவேற்கிறோம்",
    welcome_desc: "மோசடி அழைப்புகளிலிருந்து உங்களை நிகழ்நேரத்தில் பாதுகாக்கிறது. எப்போதும் செயலில், எப்போதும் பாதுகாப்பானது. பென்ஜேண்ட்ரு வருண் உருவாக்கினார்.",
    start_btn: "பாதுகாப்பைத் தொடங்கு",
    status_monitoring: "AI கண்காணிப்பு செயலில் உள்ளது",
    monitoring_desc: "VoiceShield அழைப்புகளுக்காக காத்திருக்கிறது. இது 6 நாட்கள் வரை செயலில் இருக்கும். பேசும்போது ஃபோனை ஸ்பீக்கரில் வைக்கவும்.",
    awaiting: "ஒலிக்காகக் காத்திருக்கிறது",
    red_flag: "ஆபத்து கண்டறியப்பட்டது",
    safe_call: "பாதுகாப்பான உரையாடல்",
    hang_up: "🚨 உடனே இணைப்பைத் துண்டிக்கவும் 🚨",
    report: "அழைப்பை முடித்து அறிக்கை செய்",
    summary: "பாதுகாப்பு அறிக்கை",
    action_needed: "உடனடி நடவடிக்கை தேவை",
    chatbot_title: "மோசடி ஆலோசனை AI",
    reset: "மீட்டமை",
    developed_by: "உருவாக்கியவர்: பென்ஜேண்ட்ரு வருண்"
  }
};

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
  const [lang, setLang] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [risk, setRisk] = useState<RiskResult>({
    risk_score: 0,
    risk_label: 'SAFE',
    explanation: 'VoiceShield is monitoring for threats...',
    triggers: []
  });

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hello! I am your AI Fraud Advisor. How can I help you regarding security today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persistent Monitoring Heartbeat (6-Day Feature)
  useEffect(() => {
    if ((view === 'monitoring' || view === 'active') && mounted) {
      const interval = setInterval(() => {
        if (!isListening) {
          startSpeechRecognition();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [view, isListening, mounted]);

  // WebSocket Connection
  useEffect(() => {
    if (!mounted) return;

    if (view === 'monitoring' || view === 'active') {
      const callId = "persist_v3_" + Math.random().toString(36).substring(7);
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/call/${callId}`;

      try {
        socketRef.current = new WebSocket(wsUrl);
        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'risk_update') {
            const newRisk = data.payload;
            setRisk(newRisk);
            if (newRisk.risk_label === 'HIGH' || newRisk.risk_label === 'MEDIUM') {
              setView('active');
            }
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
    // Map internal lang to speech recognition locale
    const locales = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN' };
    recognitionRef.current.lang = locales[lang];

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

    recognitionRef.current.onend = () => {
      if (view === 'monitoring' || view === 'active') {
        try { recognitionRef.current.start(); } catch (e) { }
      }
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');
    let aiResponse = lang === 'te'
      ? "మీ భద్రత మాకు ముఖ్యం. దయచేసి OTP లేదా పాస్‌వర్డ్ ఎవరికీ చెప్పకండి."
      : "Safety first. Never share OTP or PINs over phone calls. Report to 1930.";
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">

      {/* --- SETTINGS / LANGUAGE OVERLAY --- */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          className="rounded-full w-12 h-12 p-0 bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl"
          onClick={() => setShowLangMenu(!showLangMenu)}
        >
          {showLangMenu ? <X className="w-5 h-5 text-white" /> : <Settings className="w-5 h-5 text-white" />}
        </Button>

        <AnimatePresence>
          {showLangMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-16 right-0 bg-slate-900/95 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-3xl w-48 overflow-hidden"
            >
              <div className="text-[10px] font-black tracking-widest text-slate-500 mb-3 px-2">SELECT LANGUAGE</div>
              <div className="space-y-1">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'te', label: 'తెలుగు (Telugu)' },
                  { id: 'hi', label: 'हिन्दी (Hindi)' },
                  { id: 'ta', label: 'தமிழ் (Tamil)' }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setLang(l.id as Language); setShowLangMenu(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${lang === l.id ? 'bg-primary text-white' : 'hover:bg-white/5 text-slate-300'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">

        {/* --- PAGE 1: THE WELCOME SCREEN (Correct Implementation) --- */}
        {view === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen w-full">
            <WelcomeScreen
              imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop"
              title={<>{t.welcome_title}</>}
              description={t.welcome_desc}
              buttonText={t.start_btn}
              onButtonClick={() => { setView('monitoring'); startSpeechRecognition(); }}
            />
          </motion.div>
        )}

        {/* --- PAGE 2: PERSISTENT MONITORING (6 DAYS) --- */}
        {view === 'monitoring' && (
          <motion.div key="monitoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-screen p-8 text-center bg-slate-950">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <Shield className="w-24 h-24 text-primary relative z-10" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter">{t.status_monitoring}</h2>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">{t.monitoring_desc}</p>
            <div className="flex gap-4 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t.awaiting}</span>
            <div className="fixed bottom-12 flex gap-4 opacity-10 hover:opacity-100 transition-opacity">
              <Button variant="ghost" className="text-[10px]" onClick={() => setView('active')}>Simulate Alert</Button>
            </div>
          </motion.div>
        )}

        {/* --- PAGE 3: FULL SCREEN FLAG ALERT --- */}
        {view === 'active' && (
          <motion.div
            key="active"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${risk.risk_label === 'HIGH' ? 'bg-red-600' : 'bg-green-500'}`}
          >
            {/* LARGE MOVING FLAGS */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="moving-flag text-[150px]">🚩</div>
              <div className="moving-flag text-[150px] [animation-delay:1.5s] mt-64 ml-20">🚩</div>
            </div>

            <div className="text-[120px] mb-8 drop-shadow-2xl">🚩</div>
            <h1 className="text-5xl font-black text-white mb-8 italic drop-shadow-xl text-center uppercase tracking-tighter">
              {risk.risk_label === 'HIGH' ? t.red_flag : t.safe_call}
            </h1>

            {risk.risk_label === 'HIGH' ? (
              <div className="flex flex-col items-center">
                <img
                  src="https://www.freeiconspng.com/uploads/skull-and-bones-icon-22.png"
                  alt="Danger"
                  className="w-48 h-48 danger-animate mb-10 invert brightness-200"
                />
                <div className="bg-black/60 p-8 rounded-[40px] backdrop-blur-3xl border border-white/20 text-center max-w-md shadow-3xl">
                  <p className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">{t.hang_up}</p>
                  <p className="text-white/90 font-medium leading-normal">{risk.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-32 h-32 text-white mb-6 drop-shadow-lg" />
                <p className="text-white text-xl font-black uppercase tracking-widest shadow-text">CONVERSATION IS SECURE</p>
              </div>
            )}

            <Button
              onClick={() => setView('summary')}
              className="mt-14 bg-white text-black hover:bg-slate-100 h-16 px-12 rounded-[24px] font-black text-xl shadow-4xl transform active:scale-95 transition-all"
            >
              {t.report}
            </Button>
          </motion.div>
        )}

        {/* --- PAGE 4: SUMMARY & PERSISTENT CHAT --- */}
        {view === 'summary' && (
          <motion.div key="summary" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-h-screen bg-slate-950 p-6 pb-24 relative">
            <div className="text-center mb-10 pt-10">
              <div className="w-16 h-1 w-12 bg-primary mx-auto mb-4 rounded-full"></div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{t.summary}</h2>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-[10px] py-1 px-3 bg-white/5 rounded-full text-primary font-black uppercase tracking-widest">{t.developed_by}</span>
              </div>
            </div>

            <div className={`p-10 rounded-[40px] border-4 text-center mb-8 relative overflow-hidden ${risk.risk_label === 'HIGH' ? 'border-red-500 bg-red-600/10' : 'border-green-500 bg-green-500/10'}`}>
              <span className="text-6xl mb-6 block">{risk.risk_label === 'HIGH' ? '🚫' : '✅'}</span>
              <h3 className="text-3xl font-black leading-tight">{risk.risk_label === 'HIGH' ? 'FRAUD ATTEMPT TERMINATED' : 'CLEAN SESSION'}</h3>
              <p className="text-lg mt-4 font-semibold opacity-80">{risk.explanation}</p>
            </div>

            {risk.risk_label === 'HIGH' && (
              <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[36px] mb-8 relative">
                <div className="absolute top-4 right-8 opacity-10"><AlertTriangle className="w-20 h-20" /></div>
                <h4 className="text-red-500 font-extrabold text-xl mb-6 flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6" /> {t.action_needed}
                </h4>
                <div className="space-y-4 text-base font-bold text-slate-200">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">1</div>
                    <p>Block that phone number in your call settings immediately.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">2</div>
                    <p>Call the National Cyber Crime Helpline at <b>1930</b>.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">3</div>
                    <p>Secure your bank app by changing your <b>UPI PIN</b> and Login passwords.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-14">
              <div className="flex items-center gap-3 mb-6 px-4">
                <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center"><MessageSquare className="w-5 h-5 text-primary" /></div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">{t.chatbot_title}</h3>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-[40px] overflow-hidden shadow-4xl backdrop-blur-xl">
                <div className="h-[450px] overflow-y-auto p-8 flex flex-col gap-5">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-[80%] p-5 rounded-[24px] text-base leading-relaxed font-semibold ${msg.role === 'user' ? 'bg-primary text-white self-end ml-10 rounded-tr-none' : 'bg-slate-800 text-slate-100 self-start mr-10 rounded-tl-none border border-white/5'}`}
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-[20px] px-6 h-14 flex-1 text-base font-semibold focus:ring-4 ring-primary/20 transition-all outline-none"
                    placeholder="Type any security question..."
                  />
                  <Button type="submit" className="h-14 w-14 p-0 rounded-[20px] shadow-lg shadow-primary/20">
                    <MessageSquare className="w-6 h-6" />
                  </Button>
                </form>
              </div>
            </div>

            <div className="mt-10 px-4">
              <Button onClick={() => { setView('welcome'); setTranscript([]); setRisk({ risk_score: 0, risk_label: 'SAFE', explanation: 'VoiceShield is monitoring...', triggers: [] }); }} variant="outline" className="w-full h-16 rounded-[24px] border-white/20 bg-transparent text-lg font-black tracking-tight hover:bg-white/5 transition-colors">
                {t.reset}
              </Button>
            </div>

            <footer className="mt-20 text-center pb-20">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">VOICESHIELD SECURITY PROTOCOL V3.5</p>
              <p className="text-xs font-bold text-slate-400">© 2026 • Penjendru Varun • {t.developed_by}</p>
              <div className="mt-4 flex justify-center gap-4">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-primary uppercase">Always-Active Persistence Monitoring Engaged</span>
              </div>
            </footer>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
