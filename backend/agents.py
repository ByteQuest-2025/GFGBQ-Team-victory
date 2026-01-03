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
        Uses Google Gemini for advanced analysis, falling back to rule-based if needed.
        """
        if not self.api_key:
            return self.rule_based_analyze(transcript_history)

        try:
            formatted_history = "\n".join([
                f"{turn['speaker']}: {turn['text']}"
                for turn in transcript_history
            ])

            prompt = f"{self.system_prompt}\n\nConversation so far:\n{formatted_history}\n\nAnalyze and return JSON:"
            
            response = self.model.generate_content(prompt)
            # Find JSON in the response (sometimes Gemini wraps it in ```json)
            raw_text = response.text
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "{" in raw_text:
                raw_text = raw_text[raw_text.find("{"):raw_text.rfind("}")+1]

            result_data = json.loads(raw_text)
            return RiskResult(**result_data)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return self.rule_based_analyze(transcript_history)

    def rule_based_analyze(self, history: List[dict]) -> RiskResult:
        """Fallback rule-based engine when API is unavailable."""
        full_text = " ".join([t['text'].lower() for t in history])
        
        if any(word in full_text for word in ["otp", "pin", "cvv", "password", "code"]):
            return RiskResult(
                risk_score=95,
                risk_label="HIGH",
                explanation="The caller is asking for sensitive security codes (OTP/PIN). Banks never ask for these.",
                triggers=["REQUEST_OTP", "REQUEST_UPI_PIN", "FINANCIAL_RISK"]
            )
        elif any(word in full_text for word in ["lottery", "prize", "won", "refund", "cashback"]):
            return RiskResult(
                risk_score=50,
                risk_label="MEDIUM",
                explanation="Potential prize or refund scam detected. Proceed with caution.",
                triggers=["PRIZE_LOTTERY_SCAM", "FAKE_REFUND"]
            )
        
        return RiskResult(
            risk_score=10,
            risk_label="SAFE",
            explanation="No immediate scam signals detected.",
            triggers=["NO_RISK_SIGNAL"]
        )
