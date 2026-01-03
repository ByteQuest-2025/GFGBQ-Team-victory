from pydantic import BaseModel
from typing import List, Optional
import json
import os
import google.generativeai as genai

# Agent Output Schema
class RiskResult(BaseModel):
    risk_score: int
    risk_label: str
    explanation: str
    triggers: List[str]

class ScamDetectionEngine:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        self.system_prompt = """
You are VoiceShield-Detect, an AI model responsible for real-time scam intent detection on phone calls.
Analyze the ongoing conversation and output a STRICT JSON object.

TYPES OF SCAMS:
- Bank / UPI / KYC scams (OTP, PIN, CVV requests)
- Refund / cashback / lottery scams
- Remote access (AnyDesk, TeamViewer)
- Impersonation (Bank, Police, Support)

SCORING:
- 0-15 SAFE: Normal talk.
- 16-35 LOW: Slightly suspicious.
- 36-65 MEDIUM: Strong scam hints (money + urgency).
- 66-100 HIGH: Direct pressure for OTP/PIN/Remote Access.

OUTPUT FORMAT (JSON ONLY):
{
  "risk_score": int,
  "risk_label": "SAFE" | "LOW" | "MEDIUM" | "HIGH",
  "explanation": "1-2 specific sentences",
  "triggers": ["REQUEST_OTP", "REQUEST_UPI_PIN", "IMPERSONATION_BANK", etc.]
}
"""

    async def analyze_transcript(self, transcript_history: List[dict]) -> RiskResult:
        """
        Uses a Hybrid approach: Rule-based for immediate overrides + Gemini for nuance.
        """
        # 1. First, run Rule-based check as a safety layer
        rule_result = self.rule_based_analyze(transcript_history)
        
        # 2. If it's already HIGH risk based on keywords, override Gemini immediately
        if rule_result.risk_label == "HIGH":
            return rule_result

        # 3. If no high risk keywords, use Gemini for deeper intent analysis
        if not self.api_key:
            return rule_result

        try:
            formatted_history = "\n".join([
                f"{turn['speaker']}: {turn['text']}"
                for turn in transcript_history
            ])

            prompt = f"{self.system_prompt}\n\nConversation so far:\n{formatted_history}\n\nAnalyze and return JSON:"
            
            response = self.model.generate_content(prompt)
            raw_text = response.text
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "{" in raw_text:
                raw_text = raw_text[raw_text.find("{"):raw_text.rfind("}")+1]

            result_data = json.loads(raw_text)
            
            # Safety Layer: If rule-based detected MEDIUM but Gemini says SAFE, promote back to MEDIUM
            if rule_result.risk_label == "MEDIUM" and result_data.get("risk_label") == "SAFE":
                result_data["risk_label"] = "MEDIUM"
                result_data["risk_score"] = max(rule_result.risk_score, result_data["risk_score"])
                result_data["explanation"] = "AI was unsure, but VoiceShield detected suspicious keywords."

            return RiskResult(**result_data)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return rule_result

    def rule_based_analyze(self, history: List[dict]) -> RiskResult:
        """Robust fallback rule-based engine for real-time scam detection."""
        full_text = " ".join([t['text'].lower() for t in history])
        
        # High Risk Keywords (Direct Financial/Access Threats)
        high_risk_words = [
            "otp", "one time password", "digit code", "pin", "cvv", "password", 
            "anydesk", "teamviewer", "rustdesk", "screen share", "kyc update",
            "account blocked", "aadhar card", "pan card", "bank details"
        ]
        
        # Medium Risk Keywords (Urgency/Rewards)
        med_risk_words = [
            "lottery", "prize", "won", "reward", "kbc", "customer care", 
            "refund", "cashback", "lucky draw", "urgent", "last chance"
        ]

        # Hindi/Hinglish Scam Keywords
        hindi_scam_words = [
            "khata band", "police case", "jail", "link pe click", 
            "paisa won", "inam", "batchiye", "nikal jayega", "otpee bataye"
        ]

        # Telugu Scam Keywords
        telugu_scam_words = [
            "otp cheppandi", "cheppandi", "khata block", "paisa vachindi", 
            "gelicharu", "download cheyyandi", "anydesk ekkinchandi"
        ]

        # Tamil Scam Keywords
        tamil_scam_words = [
            "otp sollunga", "sollunga", "panam", "parisu", 
            "vettri", "download pannunga", "account thadai"
        ]

        detected_triggers = []
        score = 0

        # Check for High Risk
        for word in high_risk_words:
            if word in full_text:
                score += 80  # Drastically increase score for critical threats
                if "otp" in word or "code" in word: detected_triggers.append("REQUEST_OTP")
                if "pin" in word: detected_triggers.append("REQUEST_UPI_PIN")
                if "anydesk" in word or "share" in word: detected_triggers.append("REMOTE_ACCESS")

        # Check for Medium Risk
        for word in med_risk_words:
            if word in full_text:
                score += 30
                detected_triggers.append("URGENCY_SCAM")

        # Check for Regional Scam Patterns
        for word in hindi_scam_words + telugu_scam_words + tamil_scam_words:
            if word in full_text:
                score += 50
                detected_triggers.append("REGIONAL_FRAUD_PATTERN")

        # Deduplicate triggers
        detected_triggers = list(set(detected_triggers)) if detected_triggers else ["NO_RISK_DETECTED"]

        # Final Score and Label Mapping
        if score >= 70:
            label = "HIGH"
            explanation = "ALARMING: The caller is asking for highly sensitive security information (OTP/PIN) or urgency tactics. HANG UP IMMEDIATELY."
        elif score >= 25:
            label = "MEDIUM"
            explanation = "SUSPICIOUS: Potential mention of rewards, urgency, or account verification. This matches known scam patterns."
        else:
            label = "SAFE"
            explanation = "VoiceShield hasn't detected any definitive scam patterns yet. Stay vigilant."

        return RiskResult(
            risk_score=min(score, 100),
            risk_label=label,
            explanation=explanation,
            triggers=detected_triggers
        )
