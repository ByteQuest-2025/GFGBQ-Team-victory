'use client';

import { useState, useEffect, useRef } from 'react';
import { Shield, Globe, Mic, MicOff, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';

// Language translations
const translations = {
  en: { title: 'VoiceShield Elder Guard', subtitle: 'Real-Time Scam Call Defender', startBtn: 'Start Secure Protection', stopBtn: 'Stop Protection', status: 'Protection Status', on: 'ON', off: 'OFF', days: 'Days', listening: 'Listening...', safe: 'Safe', danger: 'Danger', suspicious: 'Suspicious', safeMsg: 'This call looks safe so far', dangerMsg: 'Caller is asking for OTP or personal details. Hang up now!', askMsg: 'Ask VoiceShield Assistant', chatPlaceholder: 'Type your question...' },
  ta: { title: 'வாய்ஸ்ஷீல்ட் மூத்த காவலர்', subtitle: 'நேரடி மோசடி அழைப்பு பாதுகாப்பு', startBtn: 'பாதுகாப்பை தொடங்கு', stopBtn: 'பாதுகாப்பை நிறுத்து', status: 'பாதுகாப்பு நிலை', on: 'இயக்கத்தில்', off: 'முடக்கத்தில்', days: 'நாட்கள்', listening: 'கேட்டு கொண்டிருக்கிறது...', safe: 'பாதுகாப்பானது', danger: 'ஆபத்து', suspicious: 'சந்தேகம்', safeMsg: 'இந்த அழைப்பு பாதுகாப்பானதாக தெரிகிறது', dangerMsg: 'OTP அல்லது தனிப்பட்ட விவரங்களை கேட்கிறார். உடனே துண்டியுங்கள்!', askMsg: 'வாய்ஸ்ஷீல்ட் உதவியாளரிடம் கேளுங்கள்', chatPlaceholder: 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...' },
  te: { title: 'వాయిస్‌షీల్డ్ ఎల్డర్ గార్డ్', subtitle: 'రియల్-టైమ్ స్కామ్ కాల్ డిఫెండర్', startBtn: 'సురక్షిత రక్షణను ప్రారంభించండి', stopBtn: 'రక్షణను ఆపండి', status: 'రక్షణ స్థితి', on: 'ఆన్', off: 'ఆఫ్', days: 'రోజులు', listening: 'వింటున్నాం...', safe: 'సురక్షితం', danger: 'ప్రమాదం', suspicious: 'అనుమానం', safeMsg: 'ఈ కాల్ ఇప్పటివరకు సురక్షితంగా కనిపిస్తోంది', dangerMsg: 'OTP లేదా వ్యక్తిగత వివరాల కోసం అడుగుతున్నారు. వెంటనే కాల్ కట్ చేయండి!', askMsg: 'వాయిస్‌షీల్డ్ అసిస్టెంట్‌ను అడగండి', chatPlaceholder: 'మీ ప్రశ్నను టైప్ చేయండి...' },
  hi: { title: 'वॉयसशील्ड एल्डर गार्ड', subtitle: 'रियल-टाइम स्कैम कॉल डिफेंडर', startBtn: 'सुरक्षित सुरक्षा शुरू करें', stopBtn: 'सुरक्षा बंद करें', status: 'सुरक्षा स्थिति', on: 'चालू', off: 'बंद', days: 'दिन', listening: 'सुन रहा है...', safe: 'सुरक्षित', danger: 'खतरा', suspicious: 'संदिग्ध', safeMsg: 'यह कॉल अभी तक सुरक्षित लग रही है', dangerMsg: 'OTP या व्यक्तिगत जानकारी मांग रहे हैं। तुरंत फोन काट दें!', askMsg: 'वॉयसशील्ड असिस्टेंट से पूछें', chatPlaceholder: 'अपना प्रश्न लिखें...' }
};

export default function Home() {
  const [lang, setLang] = useState('en');
  const [isProtecting, setIsProtecting] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(6);
  const [riskLevel, setRiskLevel] = useState<'safe' | 'danger' | 'suspicious' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<{role: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const t = translations[lang as keyof typeof translations];

  useEffect(() => {
    if (isProtecting) {
      const interval = setInterval(() => {
        setDaysRemaining(prev => {
          if (prev <= 0) {
            setIsProtecting(false);
            return 6;
          }
          return prev - 1;
        });
      }, 24 * 60 * 60 * 1000); // 1 day
      return () => clearInterval(interval);
    }
  }, [isProtecting]);

  const startProtection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          analyzeAudio(event.data);
        }
      };

      mediaRecorder.start(1000); // Capture every 1 second
      setIsProtecting(true);
      setIsListening(true);
      setDaysRemaining(6);
    } catch (err) {
      alert('Microphone access denied. Please allow microphone to use VoiceShield.');
    }
  };

  const stopProtection = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsProtecting(false);
    setIsListening(false);
    setRiskLevel(null);
    setShowChat(false);
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    // Simulated analysis - In real app, send to backend for STT + AI analysis
    const text = await simulateSpeechToText(audioBlob);
    if (text) {
      setTranscript(prev => [...prev.slice(-5), text]);
      const risk = detectScam(text);
      if (risk) {
        setRiskLevel(risk);
        setShowChat(true);
        if (risk === 'danger') {
          addChatMessage('ai', 'I detected the caller asking for OTP or personal banking details. This is very risky. Hang up now and do not share anything.');
        } else if (risk === 'suspicious') {
          addChatMessage('ai', 'This call seems suspicious. Be careful before sharing any details.');
        } else {
          addChatMessage('ai', 'No scam patterns detected yet. Still, never share OTP or PIN.');
        }
      }
    }
  };

  const simulateSpeechToText = async (blob: Blob): Promise<string> => {
    // Simulate STT - returns random phrases for demo
    const phrases = [
      'Hello, how are you?',
      'Please tell me your OTP code',
      'Share your UPI PIN for verification',
      'Your account will be blocked',
      'I am calling from your bank',
      'Just normal conversation here'
    ];
    return new Promise(resolve => {
      setTimeout(() => resolve(phrases[Math.floor(Math.random() * phrases.length)]), 500);
    });
  };

  const detectScam = (text: string): 'safe' | 'danger' | 'suspicious' | null => {
    const lowerText = text.toLowerCase();
    const dangerKeywords = ['otp', 'pin', 'cvv', 'password', 'upi pin', 'card number', 'bank account'];
    const suspiciousKeywords = ['verification', 'blocked', 'urgent', 'immediately', 'confirm'];

    if (dangerKeywords.some(kw => lowerText.includes(kw))) return 'danger';
    if (suspiciousKeywords.some(kw => lowerText.includes(kw))) return 'suspicious';
    return 'safe';
  };

  const addChatMessage = (role: string, text: string) => {
    setChatMessages(prev => [...prev, { role, text }]);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    addChatMessage('user', chatInput);
    // Simulate AI response
    setTimeout(() => {
      addChatMessage('ai', 'Based on the conversation, I recommend: Do NOT share OTP, PIN, CVV, or passwords. If you shared details, contact your bank immediately.');
    }, 1000);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2742] to-[#0f1f3a] text-white p-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => setLang(lang === 'en' ? 'ta' : lang === 'ta' ? 'te' : lang === 'te' ? 'hi' : 'en')} className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition">
          <Globe className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t.title}</h1>
          <p className="text-lg text-gray-300">{t.subtitle}</p>
        </div>

        {/* Protection Status Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">{t.status}</h3>
              <p className="text-3xl font-bold mt-2">{isProtecting ? t.on : t.off}</p>
            </div>
            {isProtecting && (
              <div className="text-right">
                <p className="text-sm text-gray-400">{t.days} Remaining</p>
                <p className="text-4xl font-bold text-cyan-400">{daysRemaining}</p>
              </div>
            )}
          </div>

          <button onClick={isProtecting ? stopProtection : startProtection} className={`w-full py-4 rounded-xl text-lg font-semibold transition transform hover:scale-105 ${isProtecting ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'}`}>
            {isProtecting ? (
              <span className="flex items-center justify-center gap-2">
                <MicOff className="w-5 h-5" /> {t.stopBtn}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" /> {t.startBtn}
              </span>
            )}
          </button>

          {isListening && (
            <p className="text-center mt-4 text-sm text-cyan-300 animate-pulse">
              {t.listening} Keep your call on speaker for best detection.
            </p>
          )}
        </div>

        {/* Risk Flag Indicator */}
        {riskLevel && (
          <div className={`transform transition-all duration-500 scale-100 ${riskLevel === 'danger' ? 'animate-shake' : 'animate-wave'}`}>
            <div className={`rounded-2xl p-8 text-center border-4 ${riskLevel === 'danger' ? 'bg-red-900/30 border-red-500' : riskLevel === 'suspicious' ? 'bg-yellow-900/30 border-yellow-500' : 'bg-green-900/30 border-green-500'}`}>
              <div className="flex justify-center mb-4">
                {riskLevel === 'danger' ? (
                  <AlertTriangle className="w-24 h-24 text-red-500 animate-pulse" />
                ) : riskLevel === 'suspicious' ? (
                  <AlertTriangle className="w-24 h-24 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-24 h-24 text-green-500" />
                )}
              </div>
              <h2 className={`text-3xl font-bold mb-3 ${riskLevel === 'danger' ? 'text-red-400' : riskLevel === 'suspicious' ? 'text-yellow-400' : 'text-green-400'}`}>
                {riskLevel === 'danger' ? t.danger : riskLevel === 'suspicious' ? t.suspicious : t.safe}
              </h2>
              <p className="text-lg">
                {riskLevel === 'danger' ? t.dangerMsg : riskLevel === 'suspicious' ? 'Be cautious. This call seems suspicious.' : t.safeMsg}
              </p>
            </div>
          </div>
        )}

        {/* Live Transcript */}
        {transcript.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mic className="w-5 h-5" /> Live Transcript
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {transcript.map((text, idx) => (
                <p key={idx} className="text-sm text-gray-300 bg-white/5 p-2 rounded">
                  {text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Chatbot */}
        {showChat && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> {t.askMsg}
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${msg.role === 'ai' ? 'bg-cyan-900/30 border border-cyan-500/30' : 'bg-white/10'}`}>
                  <p className="text-sm font-semibold mb-1">{msg.role === 'ai' ? 'VoiceShield AI' : 'You'}</p>
                  <p className="text-sm text-gray-200">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} placeholder={t.chatPlaceholder} className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <button onClick={sendChatMessage} className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-semibold transition">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes wave {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        .animate-wave { animation: wave 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
