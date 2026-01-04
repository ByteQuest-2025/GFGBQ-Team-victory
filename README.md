## Problem Statement
**Real-Time Audio Fraud Detection for Scam Prevention**

## Project Name
**VoiceShield**

## Team Name
**Victory**

## Deployed Link
🚀 [https://gfgbq-team-victory.netlify.app/](https://gfgbq-team-victory.netlify.app/)

## 2-Minute Demonstration Video
🎥 [Watch Demo Video](https://1drv.ms/v/c/e29e5db419610e88/IQA4e_Hjb4gBSYR_Pp8rQHzIAaiUOI5mlQxJPkdGsGl_cgg?e=JrbCBm)

## PPT Link
📊 [View Presentation](https://1drv.ms/p/c/e29e5db419610e88/IQDx59SRd9VUSJszakTgCOGKASKZNXaDYEzYzHODRqINEdM?e=iCbpbO)

## Repository Link
💻 [GitHub Repository](https://github.com/ByteQuest-2025/GFGBQ-Team-victory)

---

# VoiceShield – Real-Time Scam Call Defender

![VoiceShield Logo](https://img.shields.io/badge/VoiceShield-Real--Time%20Protection-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)

**VoiceShield** is a revolutionary AI-powered, real-time scam call detection system that protects users from fraud while the conversation is happening. Built for Google x GFGBQ Hackathon.

---

## 🎯 Core Objective

An AI copilot that listens to phone calls (simulated via web microphone), detects scam patterns in real-time, and proactively protects users with live alerts and AI-powered guidance.

---

## ✨ Key Features

### 🎙️ Real-Time Audio Processing
- **Dual-Voice Capture**: Listens to both user and caller when phone is on speaker
- **Streaming Transcription**: Live speech-to-text with multilingual support
- **WebSocket Integration**: Real-time communication between frontend and AI backend

### 🤖 Multi-Agent AI Scam Detection
Three specialized AI agents working in parallel:
1. **Keyword Agent**: Detects scam keywords (OTP, PIN, CVV, KYC, etc.)
2. **Pattern Agent**: Identifies urgency tactics, threats, and social engineering
3. **Context Agent**: Cross-references with known scam scripts and RBI guidelines

**Risk Scoring**: 0-100 score with labels: SAFE / LOW / MEDIUM / HIGH

### 🚦 Live Red/Green Flag System
- **🟢 GREEN FLAG**: Caller appears safe - smooth animations with reassurance
- **🔴 RED FLAG**: DANGER detected - urgent warning with shake animation
- **Chatbot Assistant**: Appears after flag to provide contextual advice

### 🌍 Multilingual Support (30+ Languages)
- English, Hindi, Tamil, Telugu, Malayalam, Kannada, Marathi, Bengali, Gujarati
- Punjabi, Odia, Assamese, Urdu, Sindhi, Nepali, Sinhala, Burmese, Thai
- Vietnamese, Indonesian, Malay, Filipino, Chinese, Japanese, Korean
- Arabic, French, Spanish, Portuguese, German, Russian, Italian, Turkish

### 👴 Guardian Mode (Elder-Friendly)
- **2x larger fonts** and buttons
- **High-contrast colors**
- **Simplified interface** with minimal options
- **Big danger banner**: "⚠️ HANG UP NOW ⚠️" for high-risk calls

### 📊 Features Overview

| Feature | Status |
|---------|--------|
| Live Call Protection | ✅ Working (Demo Mode) |
| Red/Green Flag Animations | ✅ Working |
| AI Chatbot Assistant | ✅ Working |
| Text-Based Analyzer | ✅ Working |
| Post-Call Summary | ✅ Working |
| 6-Day Protection Mode | ✅ Working |
| Multilingual UI (30+ langs) | ✅ Working |
| Guardian Mode | ✅ Working |
| Call History | ✅ Working |
| WebSocket Streaming | ✅ Backend Ready |
| Real STT Integration | 🔄 Requires API key |

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **UI Components**: Radix UI + shadcn/ui

### Backend
- **Framework**: FastAPI (Python)
- **AI Engine**: Google Gemini 1.5 Flash
- **Real-Time**: WebSocket
- **Analysis**: Hybrid (Rule-based + LLM)

### Key Technologies
- **Audio**: WebRTC getUserMedia API
- **STT**: Google Speech-to-Text (planned)
- **Pattern Matching**: Multi-language keyword detection
- **Risk Engine**: Scoring algorithm + AI reasoning

---

## � Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Google Gemini API key (optional, fallback works without it)

### Installation

#### 1. Clone & Install Frontend
```bash
cd GFGBQ-Team-victory-main
npm install
```

#### 2. Install Backend
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Set Up Environment Variables

Create `backend/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Create `.env.local` in root (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Running the Application

#### Terminal 1: Start Backend
```bash
cd backend
python main.py
```
Backend will run on `http://localhost:8000`

#### Terminal 2: Start Frontend
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

---

## 🎬 Demo Flow for Judges

### 1. **Onboarding Experience**
- Beautiful gradient splash screen
- Privacy-first permissions page
- Smooth animations throughout

### 2. **Home Dashboard**
- Toggle protection ON (6-day mode)
- See protection status and timer
- Access quick actions

### 3. **Live Protection Demo**
Open "Start Live Protection" and see:

**🎭 Simulated Scam Call Scenario:**
```
Caller: "Hello, this is State Bank customer care..."
        ↓
[Risk: LOW] - Normal greeting

Caller: "Your KYC is not updated. Account will be blocked in 24 hours."
        ↓
[Risk: MEDIUM] - 🟡 Warning: Urgency + Account threat

Caller: "Tell me the OTP that you will receive..."
        ↓
[Risk: HIGH] - 🔴 RED FLAG: "Danger: Caller asking for OTP!"
        ↓
🤖 Chatbot appears: "HANG UP NOW. Banks never ask for OTP."
```

### 4. **Post-Call Summary**
- Final risk assessment
- Key red flags detected
- Actionable advice
- User feedback (Scam / Legitimate)

### 5. **Text Analyzer**
Paste this text to see instant analysis:
```
"This is from HDFC Bank. Your account needs KYC update urgently. 
Please share the OTP we just sent to verify your identity."
```

**Result**: 🔴 HIGH RISK - OTP request from "bank"

### 6. **Multilingual Demo**
- Click globe icon (top-right)
- Switch to Tamil/Hindi/Telugu
- Entire UI translates instantly

### 7. **Guardian Mode**
- Toggle "Guardian" mode
- See 2x larger fonts and buttons
- Simplified interface for elderly users

---

## 🎨 Design Highlights

### Visual Excellence
- **Premium gradients** and glassmorphism
- **Smooth micro-animations** (Framer Motion)
- **Color-coded risk levels**: Green → Yellow → Orange → Red
- **Dark mode** for live protection screen
- **Accessible design** (WCAG compliant)

### User Experience
- **Zero learning curve**: Intuitive flow
- **One-tap protection**: Start with single button
- **Real-time feedback**: Instant risk updates
- **Context-aware help**: AI chatbot with Q&A

---

## 🔒 Privacy & Security

### Privacy-First Design
- ✅ Audio processed **only when protection is ON**
- ✅ Clear **"what we need"** permissions screen
- ✅ Option to **anonymize transcripts**
- ✅ **No contact or message access**
- ✅ User stays in control at every step

### Data Flow
1. User enables protection → Microphone access requested
2. Phone call on speaker → Dual-voice captured
3. Audio chunks → Sent to backend via WebSocket
4. STT + AI Analysis → Risk result returned
5. Frontend displays → Flags, chatbot, transcript
6. Call ends → Summary saved locally (optional backend storage)

---

## 🌟 Why VoiceShield Wins

### � Problem Framing
> "Scam calls are stealing life savings from ordinary people, especially elders. Current systems only react **after** money is gone. We prevent it **while** the call is happening."

### 🎯 Impact Angle
- **Social Cause**: Protects vulnerable populations (elderly, rural, new internet users)
- **Fintech Safety**: Directly relevant to RBI warnings and UPI ecosystem
- **Digital India**: Aligns with government's cybersecurity initiatives

### 🚀 Technical Innovation
- **Real-time AI** (not post-call analysis)
- **Multi-agent architecture** (3 specialized agents)
- **Hybrid approach** (rules + LLM for accuracy + speed)
- **Browser-based** (no app install needed for demo)
- **Multilingual** (true accessibility for India)

### 📈 Future Roadmap
1. **Telecom Integration**: Partner with Jio/Airtel for OS-level protection
2. **WhatsApp/VoIP**: Extend to WhatsApp calls, Google Meet scams
3. **Bank Integration**: Safety layer inside banking apps
4. **On-Device AI**: Privacy-first offline models
5. **Community Database**: Crowdsourced scam number blacklist

---

## 📊 Hackathon Pitch Materials

### Tagline
> **"From post-fraud regret to real-time protection."**

### One-Liner
> Real-time AI copilot that stops scam calls **before** you share your OTP.

### Demo Script (2 minutes)
1. **Open app** → Show splash screen (5 sec)
2. **Enable protection** → Toggle ON, explain 6-day mode (10 sec)
3. **Start scam call** → Run live demo with transcript (45 sec)
4. **Show RED flag** → "OTP request detected" + chatbot (20 sec)
5. **Post-call summary** → Red flags + advice (15 sec)
6. **Text analyzer** → Instant text analysis (15 sec)
7. **Multilingual** → Switch to Hindi → Guardian mode (10 sec)

---

## 🛠️ Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint check

# Backend
python main.py       # Start FastAPI server
uvicorn main:app --reload  # Auto-reload mode
```

---

## � Environment Setup

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Backend Environment Variables
```env
GOOGLE_API_KEY=your_gemini_api_key
```

**Note**: App works in fallback mode without API key using rule-based detection.

---

## 🐛 Troubleshooting

### Issue: Microphone permission denied
**Solution**: Ensure HTTPS in production or use `localhost` for testing

### Issue: WebSocket not connecting
**Solution**: Check backend is running on port 8000

### Issue: "Module not found" errors
**Solution**: Run `npm install` again

### Issue: Backend server won't start
**Solution**: Check Python 3.9+ is installed, run `pip install -r requirements.txt`

---

## 🏆 Built With ❤️ for Google x GFGBQ Hackathon

**Team Victory**

### Contributors
- Full-Stack Development
- AI/ML Integration
- UI/UX Design
- Security & Privacy

---

## 📄 License

MIT License - Built for hackathon demonstration purposes.

---

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- RBI for scam awareness guidelines
- Community for scam pattern data
- Hackathon organizers and judges

---

## 📞 Contact & Support

For demo questions or issues:
- Open an issue in this repository
- Present live at hackathon booth

---

**Remember**: Banks and government agencies **NEVER** ask for OTP, PIN, CVV, or passwords over phone calls. Stay safe! 🛡️

---

**Made with 🔥 to protect India from scam calls**


<!-- Trigger Netlify rebuild -->
