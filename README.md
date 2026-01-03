# VoiceShield – Secure Call Defender 🛡️

VoiceShield is a real-time, AI-powered "protection layer" for phone calls. Designed as a mobile-first web application, it listens to your calls via the loudspeaker and uses advanced AI to detect scam patterns, fraud intent, and emotional manipulation in real time.

## 🚀 Key Features
- **Real-Time Scam Detection**: Analyzes audio via WebSockets and identifies threats using Google Gemini AI.
- **Dynamic Risk Indicator**: Visual feedback (Safe/Suspicious/Danger) based on 0-100 risk scoring.
- **AI-Driven Suggestions**: Provides immediate actionable instructions (e.g., "Hang up now", "Do not share OTP").
- **Guardian Mode UI**: Simplified, large-font interface optimized for elderly and vulnerable users.
- **Zero-SIM Integration**: Works in any mobile browser by listening to the phone's microphone—no telecom access needed.
- **Smart Fallback**: Rule-based engine ensures reliability even without an active AI API key.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14+, TypeScript, Vanilla CSS (Premium Dark Mode UI).
- **Backend**: FastAPI (Python), WebSockets.
- **AI Engine**: Google Gemini AI (Advanced) + Custom Rule-Based Regex Engine (Fallback).
- **Audio**: Web Speech API for low-latency client-side transcription.

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API Key (Optional but recommended for Full AI features).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure API Key:
   - Create a `.env` file (or edit the existing one).
   - Add your key: `GOOGLE_API_KEY=your_gemini_api_key_here`.
4. Run the server:
   ```bash
   python main.py
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📱 How to Demo
1. Open the app in your mobile browser (or localhost:3000).
2. Tap **"Start Secure Call"**.
3. Use the **"(Testing) Simulate Scammer"** button to trigger a scripted scam call.
4. Watch the UI jump to the **DANGER** state as it detects phrases like "OTP" and "UPI PIN".
5. Note the specific AI Suggestions appearing at the bottom.

## 🛑 Important Note
VoiceShield depends on the call being on **Speakerphone** so the browser can hear the conversation through the device's microphone. It does not record or save your calls—analysis happens in real-time.

---
Built with ❤️ for scam prevention.
