'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mic, FileText, Globe, Clock, Phone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from './button';
import { useVoiceShield } from '@/lib/store';
import { useTranslations } from '@/lib/translations';
import { LanguageSelector } from './language-selector';

interface HomeScreenProps {
    onStartLiveProtection: () => void;
    onAnalyzePastConversation: () => void;
}

export function HomeScreen({ onStartLiveProtection, onAnalyzePastConversation }: HomeScreenProps) {
    const {
        isProtectionOn,
        toggleProtection,
        guardianMode,
        toggleGuardianMode,
        selectedLanguage,
        callSessions,
    } = useVoiceShield();

    const t = useTranslations(selectedLanguage);

    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(6);

    // Recent calls (mock data for demo if empty)
    const recentCalls = (callSessions?.length || 0) > 0 ? callSessions : [
        {
            id: "1",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            risk_label: "HIGH" as const,
            risk_score: 88,
            transcript: []
        },
        {
            id: "2",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            risk_label: "SAFE" as const,
            risk_score: 12,
            transcript: []
        }
    ];

    const fontSize = guardianMode ? 'text-xl' : 'text-base';
    const titleSize = guardianMode ? 'text-3xl' : 'text-xl';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            {/* App Bar */}
            <header className="bg-slate-900/50 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-blue-400" />
                    <div>
                        <h1 className="font-bold text-xl text-blue-100 leading-tight">
                            {guardianMode ? 'VoiceShield Elder Guard' : 'VoiceShield'}
                        </h1>
                        <p className="text-xs text-blue-300">Real-Time Scam Defense</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLanguageSelector(true)}
                        className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Globe className="w-6 h-6 text-blue-300" />
                    </motion.button>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-lg mx-auto pb-24">
                {/* Protection Status Card */}
                <motion.div
                    layout
                    className={`bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 ${isProtectionOn ? 'border-green-500/50 shadow-green-900/20' : 'border-white/10'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className={`${titleSize} font-bold text-blue-100`}>
                                {t('callProtection')}
                            </h2>
                            <p className={`text-gray-400 ${isProtectionOn ? 'text-green-400 font-medium' : ''}`}>
                                {isProtectionOn
                                    ? `Protection is ON.`
                                    : t('protectionOff')}
                            </p>
                        </div>
                        <Switch
                            checked={isProtectionOn}
                            onCheckedChange={toggleProtection}
                            className="scale-125 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-600"
                        />
                    </div>

                    <AnimatePresence>
                        {isProtectionOn && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mt-2"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-6 h-6 text-green-400" />
                                    <span className={`${fontSize} font-bold text-green-300`}>
                                        Day {7 - daysRemaining} of 6
                                    </span>
                                </div>
                                <p className={`${fontSize} text-green-200 leading-snug`}>
                                    VoiceShield will keep listening and warning you for up to 6 days, as long as this page stays open.
                                </p>
                                <p className={`text-sm text-green-400 mt-2 font-medium`}>
                                    ⚠️ Keep your calls on speaker so VoiceShield can listen.
                                </p>
                            </motion.div>
                        )}

                        {!isProtectionOn && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`${fontSize} text-gray-400 mt-2`}
                            >
                                Turn this ON before you answer calls to get scam protection.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className={`${titleSize} font-bold text-blue-100 ml-2`}>
                        {t('quickActions')}
                    </h3>

                    <Button
                        onClick={onStartLiveProtection}
                        size="lg"
                        className={`w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50 rounded-2xl border-t border-white/10 ${guardianMode ? 'py-8 text-2xl' : 'py-6 text-xl'}`}
                    >
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3">
                                <Mic className={guardianMode ? 'w-8 h-8' : 'w-6 h-6'} />
                                {guardianMode ? 'Start Secure Listening' : t('startLiveProtection')}
                            </div>
                            <span className="text-sm text-blue-100 font-normal mt-1 opacity-90">
                                Tap this during a call on speaker
                            </span>
                        </div>
                    </Button>

                    <Button
                        onClick={onAnalyzePastConversation}
                        variant="outline"
                        size="lg"
                        className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 text-blue-100 rounded-2xl ${guardianMode ? 'py-8 text-xl' : 'py-6 text-lg'}`}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className={guardianMode ? 'w-8 h-8 text-blue-400' : 'w-6 h-6 text-blue-400'} />
                            {t('analyzePast')}
                        </div>
                    </Button>
                </div>

                {/* Recent Checks */}
                <div>
                    <h3 className={`${titleSize} font-bold text-blue-100 ml-2 mb-3 mt-6`}>
                        {t('recentHistory')}
                    </h3>
                    <div className="space-y-3">
                        {recentCalls.map((call) => (
                            <div key={call.id} className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${call.risk_label === 'HIGH' ? 'bg-red-500/20' : call.risk_label === 'MEDIUM' ? 'bg-orange-500/20' : 'bg-green-500/20'}`}>
                                        <Phone className={`w-5 h-5 ${call.risk_label === 'HIGH' ? 'text-red-400' : call.risk_label === 'MEDIUM' ? 'text-orange-400' : 'text-green-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-gray-200 ${fontSize}`}>
                                            Call with Unknown
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(call.timestamp).toLocaleDateString()} • {new Date(call.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${call.risk_label === 'HIGH' ? 'bg-red-500/20 border-red-500/50 text-red-300' :
                                        call.risk_label === 'MEDIUM' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' :
                                            'bg-green-500/20 border-green-500/50 text-green-300'
                                    }`}>
                                    {call.risk_label === 'HIGH' ? t('highRisk') :
                                        call.risk_label === 'MEDIUM' ? t('suspicious') :
                                            t('safe')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guardian Mode Toggle */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-blue-100">Elderly / Guardian Mode</h4>
                        <p className="text-sm text-blue-300/70">Larger text & simplified interface</p>
                    </div>
                    <Switch
                        checked={guardianMode}
                        onCheckedChange={toggleGuardianMode}
                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-600"
                    />
                </div>
            </main>

            {/* Language Selector Modal */}
            <LanguageSelector
                open={showLanguageSelector}
                onOpenChange={setShowLanguageSelector}
            />
        </div>
    );
}
