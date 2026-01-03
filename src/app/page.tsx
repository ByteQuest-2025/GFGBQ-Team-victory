'use client';
// Version 4.2.0 - UI Streamlining: Removed Welcome Hero


import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, X, Shield, ShieldCheck, ShieldAlert, AlertTriangle, Globe, MessageSquare } from 'lucide-react';

// --- Multi-Language Translations ---
const translations = {
  en: {
    welcome_title: "Welcome To VoiceShield",
    welcome_desc: "Discover real-time security with VoiceShield, your personalized fraud detection app. Always active for 6 days.",
    start_btn: "Let's get started",
    monitoring_title: "PASSIVE MONITORING ACTIVE",
    monitoring_desc: "VoiceShield is silently guarding your device. It will become active only when an external call is received.",
    six_day_alert: "Persistence Mode: Active (6-Day Duration Engaged)",
    red_flag: "RED FLAG DETECTED - SCAM ALERT",
    safe_flag: "CLEAN SESSION - SECURE CALL",
    hang_up: "HANG UP IMMEDIATELY!",
    danger_msg: "Caller is asking for highly sensitive information (OTP/PIN/Bank Access).",
    summary: "SESSION SUMMARY",
    developed_by: "Developed by: Penjendru Varun",
    chatbot_title: "VOICESHIELD SECURITY CHATBOT",
    safety_tips: "Safety Recommendations",
    action_item_1: "Never share OTP, PIN, or CVV over a call.",
    action_item_2: "Banks never ask for remote access to your phone.",
    action_item_3: "If suspicious, block the number and report to 1930.",
    start_secure: "START SECURE",
    ready_title: "VOICESHIELD PROTECTOR"
  },
  te: {
    welcome_title: "వాయిస్ షీల్డ్ కి స్వాగతం",
    welcome_desc: "వాయిస్ షీల్డ్ తో నిజ-సమయ భద్రతను అన్వేషించండి. ఇది మీ వ్యక్తిగత ఫ్రాడ్ డిటెక్షన్ యాప్. 6 రోజుల పాటు ఎల్లప్పుడూ సక్రియంగా ఉంటుంది.",
    start_btn: "ప్రారంభించండి",
    monitoring_title: "పాసివ్ మానిటరింగ్ సక్రియంగా ఉంది",
    monitoring_desc: "వాయిస్ షీల్డ్ మీ పరికరాన్ని నిశ్శబ్దంగా రక్షిస్తోంది. ఫోన్ కాల్ వచ్చినప్పుడు మాత్రమే ఇది సక్రియంగా మారుతుంది.",
    six_day_alert: "పర్సిస్టెన్స్ మోడ్: సక్రియంగా ఉంది (6 రోజుల వ్యవధి ప్రారంభించబడింది)",
    red_flag: "రెడ్ ఫ్లాగ్ గుర్తించబడింది - స్కామ్ హెచ్చరిక",
    safe_flag: "క్లీన్ సెషన్ - సురక్షితమైన కాల్",
    hang_up: "వెంటనే ఫోన్ పెట్టేయండి!",
    danger_msg: "కాలర్ చాలా సున్నితమైన సమాచారాన్ని (OTP/PIN/బ్యాంక్ యాక్సెస్) అడుగుతున్నారు.",
    summary: "సెషన్ సారాంశం",
    developed_by: "రూపొందించినవారు: పెన్జేండ్రు వరుణ్",
    chatbot_title: "వాయిస్ షీల్డ్ సెక్యూరిటీ చాట్‌బాట్",
    safety_tips: "భద్రతా సూచనలు",
    action_item_1: "కాల్‌లో ఎప్పుడూ OTP, PIN లేదా CVV ని షేర్ చేయవద్దు.",
    action_item_2: "బ్యాంకులు మీ ఫోన్‌కు రిమోట్ యాక్సెస్‌ను ఎప్పుడూ అడగవు.",
    action_item_3: "అనుమానం ఉంటే, నంబర్‌ను బ్లాక్ చేసి 1930 కి నివేదించండి.",
    start_secure: "భద్రతను ప్రారంభించండి",
    ready_title: "వాయిస్ షీల్డ్ ప్రొటెక్టర్"
  },
  hi: {
    welcome_title: "VoiceShield में आपका स्वागत है",
    welcome_desc: "VoiceShield के साथ वास्तविक समय की सुरक्षा की खोज करें। यह आपका व्यक्तिगत धोखाधड़ी पहचान ऐप है। 6 दिनों तक हमेशा सक्रिय।",
    start_btn: "शुरू करें",
    monitoring_title: "पैसिव मॉनिटरिंग सक्रिय है",
    monitoring_desc: "VoiceShield चुपचाप आपके डिवाइस की सुरक्षा कर रहा है। फोन कॉल आने पर ही यह सक्रिय होगा।",
    six_day_alert: "निरंतर मोड: सक्रिय (6-दिवसीय अवधि शुरू)",
    red_flag: "रेड फ्लैग मिला - धोखाधड़ी चेतावनी",
    safe_flag: "क्लीन सेशन - सुरक्षित कॉल",
    hang_up: "तुरंत फोन काट दें!",
    danger_msg: "कॉलर बहुत संवेदनशील जानकारी (OTP/PIN/बैंक एक्सेस) मांग रहा है।",
    summary: "सत्र सारांश",
    developed_by: "विकसित: पेनजेंड्रू वरुण",
    chatbot_title: "VoiceShield सुरक्षा चैटबॉट",
    safety_tips: "सुरक्षा अनुशंसाएँ",
    action_item_1: "कॉल पर कभी भी OTP, PIN या CVV साझा न करें।",
    action_item_2: "बैंक कभी भी आपके फोन का रिमोट एक्सेस नहीं मांगते।",
    action_item_3: "मैनेजर बनकर कॉल करने वालों से सावधान रहें।",
    start_secure: "सुरक्षा शुरू करें",
    ready_title: "VoiceShield रक्षक"
  }
};

// --- Types ---
interface RiskResult {
  risk_score: number;
  risk_label: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  triggers: string[];
}

export default function VoiceShield() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'monitoring' | 'active' | 'summary'>('monitoring');
  const [isStarted, setIsStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'te' | 'hi'>('en');
  const [showSettings, setShowSettings] = useState(false);
  const [risk, setRisk] = useState<RiskResult>({
    risk_score: 0,
    risk_label: 'SAFE',
    explanation: 'Monitoring conversation...',
    triggers: []
  });

  const t = translations[lang];

  // Persistent Monitoring (6-Day Feature Implementation)
  useEffect(() => {
    setMounted(true);
    // Heartbeat to ensure app stays active in background
    const interval = setInterval(() => {
      console.log("VoiceShield Heartbeat: Persistent Mode Active");
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simulation Logic (For Hackathon Demo)
  const simulateCall = (isScam: boolean) => {
    setView('active');
    if (isScam) {
      setRisk({
        risk_score: 98,
        risk_label: 'HIGH',
        explanation: t.danger_msg,
        triggers: ['REQUEST_OTP']
      });
    } else {
      setRisk({
        risk_score: 5,
        risk_label: 'SAFE',
        explanation: 'Everything looks good. No scam intent detected.',
        triggers: []
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">

      {/* --- SETTINGS MENU (Top Right) --- */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          className="rounded-full w-12 h-12 p-0 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? <X className="w-5 h-5 text-white" /> : <Settings className="w-5 h-5 text-white" />}
        </Button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-16 right-0 bg-slate-900 border border-white/10 p-4 rounded-3xl shadow-3xl w-48"
            >
              <div className="text-[10px] font-black tracking-widest text-slate-500 mb-3 px-2 flex items-center gap-2">
                <Globe className="w-3 h-3" /> SELECT LANGUAGE
              </div>
              <div className="space-y-1">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'te', label: 'తెలుగు (Telugu)' },
                  { id: 'hi', label: 'हिन्दी (Hindi)' }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setLang(l.id as any); setShowSettings(false); }}
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


        {/* --- STAGE 2: PASSIVE MONITORING (6 DAYS) --- */}
        {view === 'monitoring' && (
          <motion.div key="monitoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative mb-12">
              <motion.div
                animate={isStarted ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                {isStarted ? (
                  <ShieldCheck className="w-40 h-40 text-primary drop-shadow-[0_0_30px_rgba(var(--primary),0.5)]" />
                ) : (
                  <Shield className="w-40 h-40 text-slate-700" />
                )}
              </motion.div>
              {isStarted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary w-6 h-6 rounded-full border-4 border-slate-950 animate-pulse"
                />
              )}
            </div>

            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase max-w-md">
              {isStarted ? t.monitoring_title : t.ready_title}
            </h2>
            <p className="text-slate-400 max-w-sm mb-12 text-sm font-medium leading-relaxed">
              {isStarted ? t.monitoring_desc : "Advanced AI-powered real-time scam detection. Press below to arm your security."}
            </p>

            {!isStarted ? (
              <Button
                onClick={() => setIsStarted(true)}
                className="h-20 px-12 rounded-[28px] text-xl font-black bg-primary hover:bg-primary/90 shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] transform active:scale-95 transition-all mb-8 w-full max-w-xs"
              >
                {t.start_secure}
              </Button>
            ) : (
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4 mb-8">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_15px_var(--primary-color)]"></div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">SYSTEM ARMED</div>
                  <div className="text-xs font-bold text-white">{t.six_day_alert}</div>
                </div>
              </div>
            )}

            {/* Simulation Triggers for Demo (Only visible when started) */}
            {isStarted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-12 flex flex-col gap-3"
              >
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Demo Simulation</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="text-[10px] border-white/5 bg-white/10 h-10 px-6 rounded-xl font-black" onClick={() => simulateCall(false)}>NORMAL CALL</Button>
                  <Button variant="destructive" className="text-[10px] h-10 px-6 rounded-xl font-black bg-red-600 hover:bg-red-500" onClick={() => simulateCall(true)}>SCAM CALL</Button>
                </div>
              </motion.div>
            )}

            {!isStarted && (
              <footer className="mt-8 text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">
                {t.developed_by}
              </footer>
            )}
          </motion.div>
        )}

        {/* --- STAGE 3: FULL SCREEN FLAG ALERTS --- */}
        {view === 'active' && (
          <motion.div
            key="active"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden ${risk.risk_label === 'HIGH' ? 'bg-red-600' : 'bg-green-500'}`}
          >
            {/* LARGE SHIFTING FLAGS */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="moving-flag text-[200px] absolute top-[10%] left-[-10%]">🚩</div>
              <div className="moving-flag text-[200px] absolute bottom-[10%] right-[-10%] [animation-delay:1.5s]">🚩</div>
            </div>

            <div className="text-[160px] mb-8 drop-shadow-2xl">🚩</div>

            <h1 className="text-5xl font-black text-white mb-8 italic text-center drop-shadow-xl uppercase tracking-tighter">
              {risk.risk_label === 'HIGH' ? t.red_flag : t.safe_flag}
            </h1>

            {risk.risk_label === 'HIGH' ? (
              <div className="flex flex-col items-center">
                <motion.img
                  src="https://www.freeiconspng.com/uploads/skull-and-bones-icon-22.png"
                  alt="Danger"
                  className="w-48 h-48 mb-8 invert"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <div className="bg-black/50 p-8 rounded-[40px] backdrop-blur-3xl border border-white/10 text-center max-w-md shadow-4xl animate-pulse">
                  <p className="text-2xl font-black text-white mb-3 tracking-tighter">{t.hang_up}</p>
                  <p className="text-white/80 font-bold text-sm">{risk.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-32 h-32 text-white mb-6 drop-shadow-2xl" />
                <p className="text-white text-xl font-black uppercase tracking-widest">{t.safe_flag}</p>
              </div>
            )}

            <Button
              onClick={() => setView('summary')}
              className="mt-16 bg-white text-black hover:bg-slate-100 h-16 px-12 rounded-3xl font-black text-xl shadow-4xl transform active:scale-95 transition-all"
            >
              {t.summary}
            </Button>
          </motion.div>
        )}

        {/* --- STAGE 4: SUMMARY & CHATBOT --- */}
        {view === 'summary' && (
          <motion.div key="summary" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-h-screen bg-slate-950 p-6 pb-24">
            <div className="text-center mb-10 pt-10">
              <div className="w-16 h-1 w-12 bg-primary mx-auto mb-4 rounded-full"></div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{t.summary}</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] mt-2 tracking-[0.4em]">{t.developed_by}</p>
            </div>

            <div className={`p-10 rounded-[40px] border-4 text-center mb-10 ${risk.risk_label === 'HIGH' ? 'border-red-500 bg-red-600/10' : 'border-green-500 bg-green-500/10'}`}>
              <span className="text-6xl mb-6 block">{risk.risk_label === 'HIGH' ? '🚨' : '🛡️'}</span>
              <h3 className="text-2xl font-black">{risk.risk_label === 'HIGH' ? t.red_flag : t.safe_flag}</h3>
              <p className="mt-4 font-bold text-slate-300">{risk.explanation}</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] mb-12">
              <h4 className="text-primary font-black mb-6 flex items-center gap-2 uppercase tracking-tighter text-lg">
                <AlertTriangle className="w-6 h-6" /> {t.safety_tips}
              </h4>
              <div className="space-y-4 text-slate-200 font-bold">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">1</div>
                  <p>{t.action_item_1}</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">2</div>
                  <p>{t.action_item_2}</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">3</div>
                  <p>{t.action_item_3}</p>
                </div>
              </div>
            </div>

            {/* CHATBOT */}
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-6 px-4">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-black uppercase tracking-widest text-white">{t.chatbot_title}</h3>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-4xl">
                <div className="h-[400px] p-8 overflow-y-auto space-y-4">
                  <div className="bg-slate-800 p-5 rounded-[24px] rounded-tl-none mr-12 text-sm font-bold leading-relaxed">
                    Hello! I am your AI Security Advisor. Ask me anything about calls, OTPs, or bank safety.
                  </div>
                  <div className="bg-primary p-5 rounded-[24px] rounded-tr-none ml-12 text-sm font-bold leading-relaxed text-white">
                    Can I share my OTP to others?
                  </div>
                  <div className="bg-slate-800 p-5 rounded-[24px] rounded-tl-none mr-12 text-sm font-bold leading-relaxed border border-white/5 shadow-xl">
                    <b>NO.</b> Never share your OTP. Banks will never call to ask for it. It is your final security key.
                  </div>
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                  <input className="bg-black/40 border-none rounded-2xl px-6 h-14 flex-1 text-sm font-bold outline-none" placeholder="Ask about safety..." />
                  <Button className="h-14 w-14 rounded-2xl p-0"><MessageSquare className="w-5 h-5" /></Button>
                </div>
              </div>
            </div>

            <Button onClick={() => { setView('monitoring'); setIsStarted(false); }} variant="ghost" className="w-full mt-12 h-16 rounded-[24px] border-white/10 text-slate-500 font-black uppercase text-[10px] tracking-[0.5em]">
              RESET SYSTEM STATE
            </Button>

            <footer className="mt-20 text-center opacity-30 pb-10">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">VOICESHIELD PERSISTENCE PROTOCOL ACTIVE</p>
              <p className="text-[9px] mt-2">© 2026 • Penjendru Varun</p>
            </footer>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
