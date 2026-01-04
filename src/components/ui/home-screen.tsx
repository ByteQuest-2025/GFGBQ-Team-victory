'use client';

import { motion } from 'framer-motion';
import { Shield, Play, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { useTranslations } from '@/lib/translations';
import { useVoiceShield } from '@/lib/store';
import { LanguageSelector } from './language-selector';

interface HomeScreenProps {
    onStartLiveProtection: () => void;
    onAnalyzePastConversation: () => void;
}

export function HomeScreen({ onStartLiveProtection, onAnalyzePastConversation }: HomeScreenProps) {
    const {
        selectedLanguage,
        isProtectionActive,
        protectionStartTime,
        daysRemaining,
        callHistory,
        startProtection,
        stopProtection,
        guardianMode,
        toggleGuardianMode,
    } = useVoiceShield();

    const t = useTranslations(selectedLanguage);

    const toggleProtection = () => {
        if (isProtectionActive) {
            stopProtection();
        } else {
            startProtection();
        }
    };

    const fontSize = guardianMode ? 'text-2xl' : 'text-base';
    const spacing = guardianMode ? 'space-y-8' : 'space-y-6';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 rounded-full p-2">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-xl'}`}>
                            {t('appName')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleGuardianMode}
                            className={`px-3 py-1 rounded-lg text-sm ${guardianMode
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {guardianMode ? '👴 Guardian' : 'Normal'}
                        </button>
                        <LanguageSelector />
                    </div>
                </div>
            </div>

            <div className={`max-w-4xl mx-auto p-6 ${spacing}`}>
                {/* Protection Status Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${isProtectionActive ? 'border-green-500' : 'border-gray-200'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-2xl'}`}>
                            {t('callProtection')}
                        </h2>
                        <motion.div
                            animate={{
                                scale: isProtectionActive ? [1, 1.1, 1] : 1,
                            }}
                            transition={{
                                duration: 2,
                                repeat: isProtectionActive ? Infinity : 0,
                            }}
                        >
                            <Shield
                                className={`${guardianMode ? 'w-12 h-12' : 'w-8 h-8'} ${isProtectionActive ? 'text-green-600' : 'text-gray-400'
                                    }`}
                            />
                        </motion.div>
                    </div>

                    <p className={`mb-4 ${fontSize} ${isProtectionActive ? 'text-green-700' : 'text-gray-600'
                        }`}>
                        {isProtectionActive ? t('protectionOn') : t('protectionOff')}
                    </p>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={toggleProtection}
                            className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${isProtectionActive ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${isProtectionActive ? 'translate-x-12' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={guardianMode ? 'text-xl font-bold' : 'text-sm font-medium'}>
                            {t('toggleLabel')}
                        </span>
                    </div>

                    {isProtectionActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-green-50 rounded-xl p-4 border border-green-200"
                        >
                            <p className={`${fontSize} text-green-800`}>
                                {t('protectionDuration')}
                            </p>
                            <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-green-600 mt-2`}>
                                {t('keepSpeaker')}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-700">
                                    {t('day')} 1 {t('of')} 6
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {!isProtectionActive && (
                        <p className={`${fontSize} text-gray-500`}>
                            {t('protectionInactive')}
                        </p>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className={`font-bold mb-4 ${guardianMode ? 'text-3xl' : 'text-xl'}`}>
                        {t('quickActions')}
                    </h2>

                    <div className={guardianMode ? 'space-y-6' : 'space-y-4'}>
                        {/* Start Live Protection */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onStartLiveProtection}
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow ${guardianMode ? 'p-8' : 'p-6'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 rounded-full p-3">
                                    <Play className={guardianMode ? 'w-10 h-10' : 'w-6 h-6'} />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-lg'}`}>
                                        {t('startLiveProtection')}
                                    </h3>
                                    <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-blue-100 mt-1`}>
                                        {t('startLiveSubtitle')}
                                    </p>
                                </div>
                            </div>
                        </motion.button>

                        {/* Analyze Past Conversation */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onAnalyzePastConversation}
                            className={`w-full bg-white border-2 border-gray-300 rounded-xl shadow hover:shadow-lg transition-shadow ${guardianMode ? 'p-8' : 'p-6'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 rounded-full p-3">
                                    <FileText className={`${guardianMode ? 'w-10 h-10' : 'w-6 h-6'} text-gray-700`} />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className={`font-bold text-gray-900 ${guardianMode ? 'text-3xl' : 'text-lg'}`}>
                                        {t('analyzePastConversation')}
                                    </h3>
                                    <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-gray-600 mt-1`}>
                                        {t('analyzePastSubtitle')}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Recent Checks */}
                {callHistory.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className={`font-bold mb-4 ${guardianMode ? 'text-3xl' : 'text-xl'}`}>
                            {t('recentChecks')}
                        </h2>

                        <div className="space-y-3">
                            {callHistory.slice(0, 5).map((call) => (
                                <div
                                    key={call.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className={`font-medium ${guardianMode ? 'text-xl' : 'text-base'}`}>
                                                {new Date(call.startTime).toLocaleString()}
                                            </p>
                                            {call.finalRisk && (
                                                <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-gray-600 mt-1`}>
                                                    {call.finalRisk.explanation}
                                                </p>
                                            )}
                                        </div>
                                        {call.finalRisk && (
                                            <div className={`ml-4 px-4 py-2 rounded-full font-bold ${guardianMode ? 'text-lg' : 'text-sm'} ${call.finalRisk.risk_label === 'HIGH'
                                                    ? 'bg-red-100 text-red-700'
                                                    : call.finalRisk.risk_label === 'MEDIUM'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                {call.finalRisk.risk_label === 'HIGH'
                                                    ? t('highRisk')
                                                    : call.finalRisk.risk_label === 'MEDIUM'
                                                        ? t('suspicious')
                                                        : t('safe')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Warning Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`bg-yellow-50 border-l-4 border-yellow-400 rounded-lg ${guardianMode ? 'p-6' : 'p-4'}`}
                >
                    <p className={`${guardianMode ? 'text-xl' : 'text-sm'} text-yellow-800`}>
                        ⚠️ {t('neverShare')}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
