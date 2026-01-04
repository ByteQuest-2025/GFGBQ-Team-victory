from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
from agents import ScamDetectionEngine, RiskResult
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VoiceShield API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ScamDetectionEngine()

class TextAnalysisRequest(BaseModel):
    text: str
    language: str = "en"

@app.get("/")
async def root():
    return {"message": "VoiceShield API is running"}

@app.post("/api/analyze-text")
async def analyze_text(request: TextAnalysisRequest):
    """Analyze text conversation for scam patterns"""
    # Create a single transcript entry
    transcript = [{
        "speaker": "caller",
        "text": request.text,
        "language": request.language
    }]
    
    # Use the same analysis engine
    risk_result = await engine.analyze_transcript(transcript)
    return risk_result.dict()

@app.websocket("/ws/call/{call_id}")
async def call_socket(websocket: WebSocket, call_id: str):
    await websocket.accept()
    history = []
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "transcript":
                payload = message.get("payload")
                history.append(payload)
                
                # Analyze with advanced AI engine (Gemini)
                risk_result = await engine.analyze_transcript(history)
                
                await websocket.send_json({
                    "type": "risk_update",
                    "payload": risk_result.dict()
                })
            
            elif message.get("type") == "end_call":
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

