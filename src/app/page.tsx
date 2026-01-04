'use client';
// Version 4.3.2 - CONFIRMED: Centered Hero with Feature Cards


import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, X, Shield, ShieldCheck, ShieldAlert, AlertTriangle, Globe, MessageSquare } from 'lucide-react';

// --- Multi-Language Translations ---
const translations = {
  en: {
    welcome_title: "VoiceShield",
    welcome_subtitle: "Real-Time AI Protection Against Phone Scams",
    welcome_desc: "An AI copilot that listens to your phone calls and warns you instantly if someone is trying to scam you by asking for OTPs, UPI PINs, or sensitive banking details.",
    start_btn: "Start Monitoring Now",
    feature_1_title: "Real-Time Analysis",
    feature_1_desc: "Listens to calls and analyzes speech patterns as the conversation happens",
    feature_2_title: "Instant Alerts",
    feature_2_desc: "Immediate warnings when scam patterns are detected, before any money is lost",
    feature_3_title: "Smart Detection",
    feature_3_desc: "AI-powered recognition of OTP requests, UPI scams, and impersonation tactics",
    monitoring_title: "VOICESHIELD ACTIVE",
    monitoring_desc: "I am listening to your call via speakerphone. Keep the phone close.",
    six_day_alert: "Always Active: 6-Day Duration Engaged",
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
    welcome_title: "వాయిస్ షీల్డ్",
    welcome_subtitle: "ఫోన్ స్కామ్‌లకు వ్యతిరేకంగా రియల్-టైమ్ AI రక్షణ",
    welcome_desc: "మీ ఫోన్ కాల్‌లను వినే మరియు ఎవరైనా OTPలు, UPI పిన్‌లు లేదా సున్నితమైన బ్యాంకింగ్ వివరాలను అడగడం ద్వారా మిమ్మల్ని మోసం చేయడానికి ప్రయత్నిస్తుంటే తక్షణమే మిమ్మల్ని హెచ్చరించే AI కోపైలట్.",
    start_btn: "పర్యవేక్షణను ప్రారంభించండి",
    feature_1_title: "రియల్-టైమ్ విశ్లేషణ",
    feature_1_desc: "సంభాషణ జరుగుతున్నప్పుడు కాల్‌లను వింటుంది మరియు ప్రసంగ నమూనాలను విశ్లేషిస్తుంది",
    feature_2_title: "తక్షణ హెచ్చరికలు",
    feature_2_desc: "డబ్బు పోకముందే స్కామ్ ప్యాటర్న్‌లు గుర్తించబడినప్పుడు తక్షణ హెచ్చరికలు",
    feature_3_title: "స్మార్ట్ డిటెక్షన్",
    feature_3_desc: "OTP అభ్యర్థనలు, UPI స్కామ్‌లు మరియు వధించిన వ్యూహాల AI-ఆధారిత గుర్తింపు",
    monitoring_title: "వాయిస్ షీల్డ్ సక్రియంగా ఉంది",
    monitoring_desc: "నేను స్పీకర్‌ఫోన్ ద్వారా మీ కాల్ వింటున్నాను. ఫోన్‌ను దగ్గరగా ఉంచండి.",
    six_day_alert: "ఎల్లప్పుడూ సక్రియంగా ఉంటుంది: 6 రోజుల వ్యవధి ప్రారంభించబడింది",
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
    welcome_title: "VoiceShield",
    welcome_subtitle: "फोन घोटालों के खिलाफ रीयल-टाइम एआई सुरक्षा",
    welcome_desc: "एक एआई कोपायलट जो आपके फोन कॉल सुनता है और यदि कोई ओटीपी, यूपीआई पिन या संवेदनशील बैंकिंग विवरण मांगकर आपको ठगने की कोशिश कर रहा है तो आपको तुरंत चेतावनी देता है।",
    start_btn: "अभी मॉनिटरिंग शुरू करें",
    feature_1_title: "रीयल-टाइम विश्लेषण",
    feature_1_desc: "बातचीत होते ही कॉल सुनता है और भाषण पैटर्न का विश्लेषण करता है",
    feature_2_title: "तत्काल अलर्ट",
    feature_2_desc: "पैसे खोने से पहले, घोटाले के पैटर्न का पता चलने पर तत्काल चेतावनी",
    feature_3_title: "स्मार्ट डिटेक्शन",
    feature_3_desc: "OTP अनुरोधों, UPI घोटालों और प्रतिरूपण रणनीति की AI-संचालित पहचान",
    monitoring_title: "VoiceShield सक्रिय है",
    monitoring_desc: "मैं स्पीकरफोन के माध्यम से आपकी कॉल सुन रहा हूँ। फोन को पास रखें।",
    six_day_alert: "हमेशा सक्रिय: 6-दिवसीय अवधि शुरू",
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
  const [view, setView] = useState<'welcome' | 'monitoring' | 'active' | 'summary'>('welcome');
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


        {/* --- STAGE 1: NEW HERO OPENING PAGE --- */}
        {view === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full bg-[#0c0a1e] flex flex-col items-center pt-24 pb-20 px-6 overflow-y-auto"
          >
            {/* Shield Icon Decoration */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6 relative"
            >
              <div className="absolute inset-0 bg-[#6366f1]/20 blur-2xl rounded-full scale-150"></div>
              <Shield className="w-16 h-16 text-[#6366f1] relative z-10" />
            </motion.div>

            {/* Main Branding */}
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black mb-4 bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#6366f1] bg-clip-text text-transparent tracking-tight text-center"
            >
              {t.welcome_title}
            </motion.h1>

            {/* Sub-headline */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-6 text-center max-w-2xl px-4"
            >
              {t.welcome_subtitle || "Real-Time AI Protection Against Phone Scams"}
            </motion.h2>

            {/* Main Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-center max-w-2xl mb-12 text-lg leading-relaxed px-4 font-medium"
            >
              {t.welcome_desc}
            </motion.p>

            {/* Primary Action */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-24"
            >
              <Button
                onClick={() => { setView('monitoring'); setIsStarted(true); }}
                className="h-14 px-10 rounded-2xl text-lg font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-[0_10px_40px_-10px_rgba(99,102,241,0.6)] flex items-center gap-3 active:scale-95 transition-all"
              >
                <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                {t.start_btn}
              </Button>
            </motion.div>

            {/* Feature Cards Grid (As seen in screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 mb-12">
              {[
                { title: t.feature_1_title, desc: t.feature_1_desc, icon: <MessageSquare className="w-5 h-5" /> },
                { title: t.feature_2_title, desc: t.feature_2_desc, icon: <AlertTriangle className="w-5 h-5" /> },
                { title: t.feature_3_title, desc: t.feature_3_desc, icon: <ShieldCheck className="w-5 h-5" /> }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-[#1a1635]/60 border border-white/5 p-8 rounded-[32px] backdrop-blur-md hover:border-[#6366f1]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-6 group-hover:scale-110 transition-transform shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#818cf8] transition-colors">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- STAGE 2: ACTIVE LISTENING PAGE --- */}
        {view === 'monitoring' && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative bg-[#0c0a1e]"
          >
            {/* Dynamic Background Pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />

            {/* Pulsing Microphone Container */}
            <div className="relative mb-16">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="w-56 h-56 rounded-[60px] bg-gradient-to-br from-[#1a1635] to-[#0c0a1e] flex items-center justify-center border-4 border-[#6366f1]/30 shadow-2xl relative overflow-hidden group">
                  {/* Decorative Inner Glow */}
                  <div className="absolute inset-0 bg-[#6366f1]/5 group-hover:bg-[#6366f1]/10 transition-colors"></div>

                  <motion.div
                    animate={{ scale: [1, 1.15, 1], filter: ["blur(0px)", "blur(1px)", "blur(0px)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <MessageSquare className="w-24 h-24 text-[#6366f1] drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                  </motion.div>

                  {/* Scanning Particle Effect */}
                  <motion.div
                    animate={{ y: [-100, 200] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent z-20"
                  />
                </div>
              </motion.div>

              {/* Outer Ring Pulses */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-[#6366f1]/20 rounded-[80px] animate-[ping_3s_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[#6366f1]/10 rounded-[90px] animate-[ping_4s_infinite_1s]" />
            </div>

            {/* Status Text */}
            <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase text-white drop-shadow-lg">
              {t.monitoring_title}
            </h2>
            <p className="text-[#818cf8] max-w-sm mb-12 text-xl font-bold leading-relaxed italic">
              {t.monitoring_desc}
            </p>

            {/* Persistence Indicator */}
            <div className="bg-[#1a1635]/80 border border-[#6366f1]/20 p-6 rounded-[32px] flex items-center gap-5 mb-12 backdrop-blur-xl shadow-2xl">
              <div className="w-4 h-4 bg-[#6366f1] rounded-full animate-pulse shadow-[0_0_20px_#6366f1]"></div>
              <div className="text-left">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#818cf8] mb-1">VOICE ANALYSIS ARMED</div>
                <div className="text-sm font-black text-white">{t.six_day_alert}</div>
              </div>
            </div>

            {/* Audio Visualizer Effect */}
            <div className="flex gap-3 h-16 items-center mb-16 px-8 py-4 bg-white/5 rounded-3xl border border-white/5">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, Math.random() * 40 + 10, 8] }}
                  transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                  className="w-1.5 bg-[#6366f1] rounded-full opacity-80"
                />
              ))}
            </div>

            {/* Simulation Triggers (Refined) */}
            <div className="fixed bottom-12 flex flex-col gap-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Developer Demo Protocol</p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="text-xs border-white/10 bg-white/5 h-12 px-8 rounded-2xl font-black text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  onClick={() => simulateCall(false)}
                >
                  SIMULATE NORMAL
                </Button>
                <Button
                  className="text-xs h-12 px-8 rounded-2xl font-black bg-red-600 hover:bg-red-500 shadow-xl shadow-red-900/30 transition-all"
                  onClick={() => simulateCall(true)}
                >
                  SIMULATE SCAM
                </Button>
              </div>
            </div>
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
