'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Pause, Play, MessageCircle } from 'lucide-react';
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

    const audioServiceRef = useRef<AudioStreamService | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Demo mode: simulate a scam call
    const [demoMode] = useState(true);
    const [demoStep, setDemoStep] = useState(0);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentTranscript]);

    // Auto-scroll to show chatbot when risk is updated
    useEffect(() => {
        if (currentRisk && (currentRisk.risk_label === 'HIGH' || currentRisk.risk_label === 'MEDIUM')) {
            // Show flag animation
            setShowFlag(true);
            setTimeout(() => {
                setShowFlag(false);
                setShowChatbot(true);
            }, 3000); // Flag shows for 3 seconds, then chatbot appears
        } else if (currentRisk && currentRisk.risk_label === 'SAFE') {
            setShowFlag(true);
            setTimeout(() => {
                setShowFlag(false);
                setShowChatbot(true);
            }, 2000);
        }
    }, [currentRisk]);

    async function startListening() {
        // Request microphone permission
        audioServiceRef.current = new AudioStreamService();
        const hasPermission = await audioServiceRef.current.requestMicrophoneAccess();

        if (!hasPermission) {
            alert('Microphone permission is required for live protection.');
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
                text: 'Hello, this is calling from State Bank customer care. Am I speaking with account holder?',
            },
            {
                delay: 4000,
                speaker: 'user' as const,
                text: 'Yes, speaking.',
            },
            {
                delay: 6000,
                speaker: 'caller' as const,
                text: 'Sir, your KYC details are not updated. Your account will be blocked in 24 hours if you don\'t complete the verification.',
            },
            {
                delay: 8000,
                speaker: 'user' as const,
                text: 'What? How do I update it?',
            },
            {
                delay: 10000,
                speaker: 'caller' as const,
                text: 'Don\'t worry sir, I will help you. First, tell me the OTP that you will receive on your phone.',
            },
            {
                delay: 12000,
                speaker: 'user' as const,
                text: 'OTP? I haven\'t received any OTP yet.',
            },
            {
                delay: 14000,
                speaker: 'caller' as const,
                text: 'It will come in a few seconds. Once you receive it, please share the 6-digit code so I can verify your account.',
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
                    // After KYC threat
                    updateRisk({
                        risk_score: 45,
                        risk_label: 'MEDIUM',
                        explanation: 'Caller is mentioning account blocking and urgent KYC update. This matches scam patterns.',
                        triggers: ['URGENCY_PRESSURE', 'KYC_SCAM'],
                    });
                } else if (index === 4) {
                    // After OTP request - HIGH RISK
                    updateRisk({
                        risk_score: 95,
                        risk_label: 'HIGH',
                        explanation: 'DANGER: The caller is asking for OTP. Banks NEVER ask for OTP. This is a scam. Hang up immediately!',
                        triggers: ['REQUEST_OTP', 'IMPERSONATION_BANK', 'URGENCY_PRESSURE', 'FINANCIAL_RISK'],
                    });
                }

                setDemoStep(index + 1);
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

    const fontSize = guardianMode ? 'text-xl' : 'text-base';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col">
            {/* Risk Flag Animation */}
            {currentRisk && (
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

            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-xl'}`}>
                        {t('liveCallProtection')}
                    </h1>
                    <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-blue-200 mt-1`}>
                        {isPaused ? t('paused') : t('listening')}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Connection Status */}
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-sm">
                            {isListening ? 'Connected & Listening' : 'Not Connected'}
                        </span>
                    </div>

                    {/* Risk Badge */}
                    {currentRisk && !showFlag && (
                        <RiskBadge
                            riskLabel={currentRisk.risk_label}
                            riskScore={currentRisk.risk_score}
                        />
                    )}

                    {/* Live Transcript */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className={`font-bold mb-4 ${guardianMode ? 'text-2xl' : 'text-lg'}`}>
                            {t('liveTranscript')}
                        </h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {currentTranscript.length === 0 && !isListening && (
                                <div className="text-center py-12">
                                    <Mic className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                                    <p className={`${fontSize} text-gray-400`}>
                                        Tap &quot;Start Listening&quot; to begin
                                    </p>
                                </div>
                            )}

                            {currentTranscript.map((turn, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: turn.speaker === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl ${turn.speaker === 'user'
                                                ? 'bg-blue-600 rounded-br-sm'
                                                : 'bg-red-600/80 rounded-bl-sm'
                                            } ${guardianMode ? 'text-xl' : 'text-base'}`}
                                    >
                                        <p className="font-semibold mb-1">
                                            {turn.speaker === 'user' ? t('you') : t('caller')}
                                        </p>
                                        <p>{turn.text}</p>
                                        <p className="text-xs opacity-75 mt-1">
                                            {new Date(turn.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>
                    </motion.div>

                    {/* AI Analysis */}
                    {currentRisk && !showFlag && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl p-6 border-2 ${currentRisk.risk_label === 'HIGH'
                                    ? 'bg-red-900/50 border-red-500'
                                    : currentRisk.risk_label === 'MEDIUM'
                                        ? 'bg-orange-900/50 border-orange-500'
                                        : 'bg-green-900/50 border-green-500'
                                }`}
                        >
                            <h2 className={`font-bold mb-3 ${guardianMode ? 'text-2xl' : 'text-lg'}`}>
                                {t('aiAnalysis')}
                            </h2>
                            <p className={guardianMode ? 'text-xl' : 'text-base'}>
                                {currentRisk.explanation}
                            </p>

                            {currentRisk.risk_label === 'HIGH' && guardianMode && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                    }}
                                    className="mt-4 p-6 bg-red-600 rounded-xl"
                                >
                                    <p className="text-3xl font-bold text-center">
                                        ⚠️ HANG UP NOW ⚠️
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Control Panel */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-white/10 p-6">
                <div className="max-w-4xl mx-auto">
                    {!isListening ? (
                        <Button
                            onClick={startListening}
                            size="lg"
                            className={`w-full bg-green-600 hover:bg-green-700 ${guardianMode ? 'text-2xl py-8' : ''}`}
                        >
                            <Mic className={guardianMode ? 'w-8 h-8 mr-4' : 'w-5 h-5 mr-2'} />
                            Start Listening
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                onClick={togglePause}
                                variant="outline"
                                className={`flex-1 border-white/20 text-white hover:bg-white/10 ${guardianMode ? 'text-xl py-6' : ''}`}
                            >
                                {isPaused ? (
                                    <Play className={guardianMode ? 'w-7 h-7 mr-3' : 'w-5 h-5 mr-2'} />
                                ) : (
                                    <Pause className={guardianMode ? 'w-7 h-7 mr-3' : 'w-5 h-5 mr-2'} />
                                )}
                                {isPaused ? 'Resume' : t('pauseProtection')}
                            </Button>

                            <Button
                                onClick={() => setShowChatbot(!showChatbot)}
                                variant="outline"
                                className={`border-white/20 text-white hover:bg-white/10 ${guardianMode ? 'px-8' : ''}`}
                            >
                                <MessageCircle className={guardianMode ? 'w-7 h-7' : 'w-5 h-5'} />
                            </Button>

                            <Button
                                onClick={handleEndCall}
                                className={`flex-1 bg-red-600 hover:bg-red-700 ${guardianMode ? 'text-xl py-6' : ''}`}
                            >
                                <PhoneOff className={guardianMode ? 'w-7 h-7 mr-3' : 'w-5 h-5 mr-2'} />
                                {t('endCallNow')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chatbot */}
            <AnimatePresence>
                {showChatbot && currentRisk && (
                    <Chatbot
                        riskLabel={currentRisk.risk_label}
                        explanation={currentRisk.explanation}
                        language={selectedLanguage}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
