'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Pause, Play, MessageCircle, Shield } from 'lucide-react';
import { Button } from './button';
import { RiskFlag, RiskBadge } from './risk-flag';
import { Chatbot } from './chatbot';
import { useTranslations } from '@/lib/translations';
import { useVoiceShield } from '@/lib/store';
import { AudioStreamService } from '@/lib/audio-service';

interface LiveProtectionScreenProps {
    onEndSession: () => void;
}

export function LiveProtectionScreen({ onEndSession }: LiveProtectionScreenProps) {
    const {
        selectedLanguage,
        currentTranscript,
        currentRisk,
        addTranscriptTurn,
        updateRisk,
        setWsConnected,
        wsConnected,
        guardianMode,
    } = useVoiceShield();

    const t = useTranslations(selectedLanguage);

    const [isListening, setIsListening] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);
    const [showFlag, setShowFlag] = useState(false);
    const [micPermission, setMicPermission] = useState(false);
    const [decisionMade, setDecisionMade] = useState(false);

    const audioServiceRef = useRef<AudioStreamService | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Demo mode: simulate a scam call
    const [demoMode] = useState(true);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentTranscript]);

    // Logic for showing flags and chatbot
    useEffect(() => {
        if (currentRisk && currentRisk.risk_label !== 'SAFE') {
            // DANGER detected
            setDecisionMade(true);
            setShowFlag(true);

            // Auto-show chatbot after flag details
            setTimeout(() => {
                setShowFlag(false); // Hide full screen flag
                setShowChatbot(true); // Show chatbot
            }, 3500);

        } else if (currentRisk && currentRisk.risk_label === 'SAFE' && currentTranscript.length > 2) {
            // Confirmed SAFE (after a few turns)
            setDecisionMade(true);
            setShowFlag(true);

            setTimeout(() => {
                setShowFlag(false);
                setShowChatbot(true);
            }, 2500);
        }
    }, [currentRisk, currentTranscript.length]);

    async function startListening() {
        // Request microphone permission
        audioServiceRef.current = new AudioStreamService();
        const hasPermission = await audioServiceRef.current.requestMicrophoneAccess();

        if (!hasPermission) {
            alert('Microphone permission is required to hear both voices.');
            return;
        }

        setMicPermission(true);
        setIsListening(true);

        // In demo mode, simulate a scam call conversation
        if (demoMode) {
            runDemoScenario();
        } else {
            // Real mode: start audio streaming
            audioServiceRef.current.startStreaming(
                `call_${Date.now()}`,
                addTranscriptTurn,
                updateRisk,
                setWsConnected
            );
        }
    }

    function runDemoScenario() {
        // Simulate a realistic scam call conversation
        const demoScript = [
            {
                delay: 2000,
                speaker: 'caller' as const,
                text: 'Hello, this is State Bank customer care. Am I speaking with the account holder?',
            },
            {
                delay: 4000,
                speaker: 'user' as const,
                text: 'Yes, speaking.',
            },
            {
                delay: 6000,
                speaker: 'caller' as const,
                text: 'Sir, your KYC details are not updated. Your account will be blocked in 24 hours.',
            },
            {
                delay: 8000,
                speaker: 'user' as const,
                text: 'What? How do I update it?',
            },
            {
                delay: 10000,
                speaker: 'caller' as const,
                text: 'Don\'t worry. First, tell me the OTP that you will receive on your phone now.',
            },
            {
                delay: 12000,
                speaker: 'user' as const,
                text: 'OTP? I haven\'t received any OTP yet.',
            },
        ];

        demoScript.forEach((line, index) => {
            setTimeout(() => {
                addTranscriptTurn({
                    speaker: line.speaker,
                    text: line.text,
                    timestamp: new Date().toISOString(),
                });

                // Trigger risk analysis after certain lines
                if (index === 2) {
                    updateRisk({
                        risk_score: 45,
                        risk_label: 'MEDIUM',
                        explanation: 'Caller mentions account blocking and urgent KYC update.',
                        triggers: ['URGENCY_PRESSURE', 'KYC_SCAM'],
                    });
                } else if (index === 4) {
                    // HIGH RISK - OTP Request
                    updateRisk({
                        risk_score: 95,
                        risk_label: 'HIGH',
                        explanation: 'DANGER: Caller asked for OTP. Banks NEVER ask for OTP.',
                        triggers: ['REQUEST_OTP', 'IMPERSONATION_BANK', 'FINANCIAL_RISK'],
                    });
                }
            }, line.delay);
        });
    }

    function togglePause() {
        setIsPaused(!isPaused);
    }

    function handleEndCall() {
        if (audioServiceRef.current) {
            audioServiceRef.current.stopStreaming();
        }
        setIsListening(false);
        onEndSession();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col relative overflow-hidden">
            {/* Background Pulse Animation */}
            {isListening && !isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-64 h-64 bg-blue-500 rounded-full animate-ping blur-3xl" />
                </div>
            )}

            {/* Full Screen Risk Flag Animation (Overlay) */}
            <AnimatePresence>
                {showFlag && currentRisk && (
                    <RiskFlag
                        riskLabel={currentRisk.risk_label}
                        show={showFlag}
                        message={
                            currentRisk.risk_label === 'HIGH'
                                ? t('highBanner')
                                : currentRisk.risk_label === 'SAFE'
                                    ? t('safeBanner')
                                    : t('mediumBanner')
                        }
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4 z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className={`font-bold ${guardianMode ? 'text-2xl' : 'text-xl'}`}>
                        {guardianMode ? 'VoiceShield Live' : t('liveCallProtection')}
                    </h1>
                    <p className="text-blue-300 text-sm mt-1 animate-pulse">
                        {isListening
                            ? isPaused ? 'Paused & Waiting' : 'Listening to both voices...'
                            : 'Ready to listen'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 pb-32 max-w-lg mx-auto w-full z-0 h-full overflow-hidden">

                {/* Neutral State / Transcript */}
                {!decisionMade && isListening && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <Shield className="w-24 h-24 text-gray-600 animate-pulse" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-300">Listening...</h2>
                            <p className="text-gray-400 mt-2">
                                VoiceShield is analyzing both voices in real time.
                            </p>
                            <p className="text-gray-500 mt-4 text-sm">
                                Keep talking. Do not share OTP, PIN, or passwords.
                            </p>
                        </div>

                        {/* Live Transcription Preview (Subtle) */}
                        <div className="w-full mt-8 bg-white/5 rounded-xl p-4 h-32 overflow-y-auto text-left text-sm text-gray-400 font-mono scrollbar-thin scrollbar-thumb-white/10">
                            {currentTranscript.map((turn, i) => (
                                <p key={i} className="mb-1">
                                    <span className={turn.speaker === 'user' ? 'text-blue-400' : 'text-red-400'}>
                                        {turn.speaker === 'user' ? 'You: ' : 'Caller: '}
                                    </span>
                                    {turn.text}
                                </p>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                )}

                {/* Start Button (if not listening) */}
                {!isListening && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                        <div className="bg-blue-600/10 p-8 rounded-full border border-blue-500/20">
                            <Mic className="w-16 h-16 text-blue-500" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">Ready to Protect</h2>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                Tap below and put your call on speaker so we can hear both sides.
                            </p>
                        </div>
                        <Button
                            onClick={startListening}
                            className={`w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 ${guardianMode ? 'py-8 text-2xl' : 'py-6 text-xl'}`}
                        >
                            Start Secure Listening
                        </Button>
                    </div>
                )}

                {/* Risk Badge (Sticky Top if Descion Made) */}
                {decisionMade && currentRisk && !showFlag && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full mb-4"
                    >
                        <RiskBadge riskLabel={currentRisk.risk_label} riskScore={currentRisk.risk_score} />
                    </motion.div>
                )}

                {/* Chatbot (Hidden until Decision) */}
                <AnimatePresence>
                    {showChatbot && currentRisk && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            className="absolute inset-x-0 bottom-0 top-32 z-20 bg-slate-900 rounded-t-3xl shadow-2xl border-t border-white/10 flex flex-col"
                        >
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2" />
                            <div className="flex-1 overflow-hidden relative">
                                <Chatbot
                                    riskLabel={currentRisk.risk_label}
                                    explanation={currentRisk.explanation}
                                    language={selectedLanguage}
                                    embedded={true}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Persistent Controls (Bottom) */}
            {isListening && !showChatbot && (
                <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-6 z-30">
                    <div className="max-w-md mx-auto flex gap-4">
                        <Button
                            onClick={togglePause}
                            variant="outline"
                            className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                        >
                            {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Button
                            onClick={handleEndCall}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                            <PhoneOff className="mr-2 h-5 w-5" />
                            End Session
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
