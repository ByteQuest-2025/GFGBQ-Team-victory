import { create } from 'zustand';

export type RiskLabel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskResult {
    risk_score: number;
    risk_label: RiskLabel;
    explanation: string;
    triggers: string[];
}

export interface TranscriptTurn {
    speaker: 'caller' | 'user';
    text: string;
    timestamp: string;
    language?: string;
}

export interface CallSession {
    id: string;
    startTime: string;
    endTime?: string;
    transcript: TranscriptTurn[];
    finalRisk?: RiskResult;
    isScam?: boolean; // User feedback
}

export interface VoiceShieldState {
    // Protection state
    isProtectionActive: boolean;
    protectionStartTime: string | null;
    daysRemaining: number;

    // Current call state
    isListening: boolean;
    currentCallId: string | null;
    currentTranscript: TranscriptTurn[];
    currentRisk: RiskResult | null;

    // Language
    selectedLanguage: string;

    // Call history
    callHistory: CallSession[];

    // WebSocket
    wsConnected: boolean;

    // Guardian mode
    guardianMode: boolean;

    // Actions
    startProtection: () => void;
    stopProtection: () => void;
    startListening: () => void;
    stopListening: () => void;
    addTranscriptTurn: (turn: TranscriptTurn) => void;
    updateRisk: (risk: RiskResult) => void;
    endCall: (isScam: boolean) => void;
    setLanguage: (lang: string) => void;
    toggleGuardianMode: () => void;
    setWsConnected: (connected: boolean) => void;
}

export const useVoiceShield = create<VoiceShieldState>((set, get) => ({
    isProtectionActive: false,
    protectionStartTime: null,
    daysRemaining: 6,
    isListening: false,
    currentCallId: null,
    currentTranscript: [],
    currentRisk: null,
    selectedLanguage: 'en',
    callHistory: [],
    wsConnected: false,
    guardianMode: false,

    startProtection: () => {
        set({
            isProtectionActive: true,
            protectionStartTime: new Date().toISOString(),
            daysRemaining: 6,
        });
    },

    stopProtection: () => {
        set({
            isProtectionActive: false,
            protectionStartTime: null,
            isListening: false,
        });
    },

    startListening: () => {
        const callId = `call_${Date.now()}`;
        set({
            isListening: true,
            currentCallId: callId,
            currentTranscript: [],
            currentRisk: null,
        });
    },

    stopListening: () => {
        set({
            isListening: false,
        });
    },

    addTranscriptTurn: (turn: TranscriptTurn) => {
        set((state) => ({
            currentTranscript: [...state.currentTranscript, turn],
        }));
    },

    updateRisk: (risk: RiskResult) => {
        set({ currentRisk: risk });
    },

    endCall: (isScam: boolean) => {
        const state = get();
        if (state.currentCallId) {
            const session: CallSession = {
                id: state.currentCallId,
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                transcript: state.currentTranscript,
                finalRisk: state.currentRisk || undefined,
                isScam,
            };

            set((state) => ({
                callHistory: [session, ...state.callHistory],
                currentCallId: null,
                currentTranscript: [],
                currentRisk: null,
                isListening: false,
            }));
        }
    },

    setLanguage: (lang: string) => {
        set({ selectedLanguage: lang });
    },

    toggleGuardianMode: () => {
        set((state) => ({ guardianMode: !state.guardianMode }));
    },

    setWsConnected: (connected: boolean) => {
        set({ wsConnected: connected });
    },
}));
