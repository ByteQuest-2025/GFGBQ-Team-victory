import { RiskResult, TranscriptTurn } from './store';

export class AudioStreamService {
    private mediaStream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private ws: WebSocket | null = null;
    private callId: string | null = null;

    async requestMicrophoneAccess(): Promise<boolean> {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                },
            });
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }

    async startStreaming(
        callId: string,
        onTranscript: (turn: TranscriptTurn) => void,
        onRiskUpdate: (risk: RiskResult) => void,
        onConnectionChange: (connected: boolean) => void
    ) {
        this.callId = callId;

        // Connect WebSocket
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        this.ws = new WebSocket(`${wsUrl}/ws/call/${callId}`);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            onConnectionChange(true);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'transcript') {
                    onTranscript(message.payload);
                } else if (message.type === 'risk_update') {
                    onRiskUpdate(message.payload);
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            onConnectionChange(false);
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            onConnectionChange(false);
        };

        // Setup audio processing
        if (this.mediaStream) {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // For demo purposes, simulate transcript from microphone
            // In production, this would send actual audio chunks to backend for STT
            this.simulateTranscription(onTranscript);
        }
    }

    // Simulate speech-to-text for demo
    // In production, send audio chunks to backend STT service
    private simulateTranscription(onTranscript: (turn: TranscriptTurn) => void) {
        // This is a placeholder - real implementation would:
        // 1. Capture audio chunks from microphone
        // 2. Send chunks to backend via WebSocket
        // 3. Backend runs STT (Google Speech API, etc.)
        // 4. Backend sends back transcript
        // 5. We call onTranscript with the result

        console.log('Audio capture active - ready for real STT integration');
    }

    sendManualTranscript(speaker: 'caller' | 'user', text: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        const turn: TranscriptTurn = {
            speaker,
            text,
            timestamp: new Date().toISOString(),
        };

        this.ws.send(JSON.stringify({
            type: 'transcript',
            payload: turn,
        }));
    }

    stopStreaming() {
        if (this.ws) {
            this.ws.send(JSON.stringify({ type: 'end_call' }));
            this.ws.close();
            this.ws = null;
        }

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }
}

// Text-based analysis (for "Analyze Past Conversation" feature)
export async function analyzeTextConversation(text: string): Promise<RiskResult> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Create a mock call and send the text as a single transcript
        const response = await fetch(`${apiUrl}/api/analyze-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                language: 'en',
            }),
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Text analysis error:', error);

        // Fallback offline analysis
        return offlineTextAnalysis(text);
    }
}

// Offline text analysis (fallback when backend unavailable)
function offlineTextAnalysis(text: string): RiskResult {
    const lowerText = text.toLowerCase();

    const highRiskKeywords = [
        'otp', 'one time password', 'pin', 'cvv', 'password',
        'anydesk', 'teamviewer', 'screen share', 'kyc update',
        'account blocked', 'bank details', 'card number',
    ];

    const medRiskKeywords = [
        'lottery', 'prize', 'won', 'reward', 'refund',
        'cashback', 'urgent', 'verify', 'confirm',
    ];

    let score = 0;
    const triggers: string[] = [];

    highRiskKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            score += 80;
            if (keyword.includes('otp')) triggers.push('REQUEST_OTP');
            if (keyword.includes('pin')) triggers.push('REQUEST_UPI_PIN');
            if (keyword.includes('anydesk') || keyword.includes('share')) {
                triggers.push('REMOTE_ACCESS_APP');
            }
        }
    });

    medRiskKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            score += 30;
            triggers.push('URGENCY_PRESSURE');
        }
    });

    if (triggers.length === 0) {
        triggers.push('NO_RISK_SIGNAL');
    }

    let risk_label: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';
    let explanation: string;

    if (score >= 70) {
        risk_label = 'HIGH';
        explanation = 'The conversation contains requests for sensitive information like OTP, PIN, or passwords. This is a common scam pattern.';
    } else if (score >= 25) {
        risk_label = 'MEDIUM';
        explanation = 'The conversation mentions urgency or offers that could be suspicious. Be cautious.';
    } else {
        risk_label = 'SAFE';
        explanation = 'No obvious scam patterns detected in this conversation.';
    }

    return {
        risk_score: Math.min(score, 100),
        risk_label,
        explanation,
        triggers,
    };
}
