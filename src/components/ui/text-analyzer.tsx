'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, AlertTriangle, CheckCircle, Home, Loader } from 'lucide-react';
import { Button } from './button';
import { useTranslations } from '@/lib/translations';
import { useVoiceShield, RiskResult } from '@/lib/store';
import { analyzeTextConversation } from '@/lib/audio-service';

interface TextAnalyzerProps {
    onBackHome: () => void;
}

export function TextAnalyzer({ onBackHome }: TextAnalyzerProps) {
    const { selectedLanguage, guardianMode } = useVoiceShield();
    const t = useTranslations(selectedLanguage);

    const [text, setText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<RiskResult | null>(null);

    async function handleAnalyze() {
        if (!text.trim()) {
            return;
        }

        setAnalyzing(true);
        setResult(null);

        try {
            const analysisResult = await analyzeTextConversation(text);
            setResult(analysisResult);
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setAnalyzing(false);
        }
    }

    const getRiskColor = (label: string) => {
        switch (label) {
            case 'HIGH':
                return 'text-red-600';
            case 'MEDIUM':
                return 'text-orange-600';
            case 'LOW':
                return 'text-yellow-600';
            default:
                return 'text-green-600';
        }
    };

    const getRiskBgColor = (label: string) => {
        switch (label) {
            case 'HIGH':
                return 'bg-red-50 border-red-200';
            case 'MEDIUM':
                return 'bg-orange-50 border-orange-200';
            case 'LOW':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-green-50 border-green-200';
        }
    };

    const getActionAdvice = () => {
        if (!result) return [];

        if (result.risk_label === 'HIGH') {
            return [
                'Do NOT respond to this number or message',
                'Block the number immediately',
                'If you shared any OTP or PIN, contact your bank right away',
                'Report to cybercrime.gov.in or call 1930',
            ];
        } else if (result.risk_label === 'MEDIUM') {
            return [
                'Be very cautious before taking any action',
                'Verify through official channels only',
                'Never share OTP, PIN, or passwords',
                'If in doubt, ignore and block',
            ];
        } else {
            return [
                'This conversation seems safe, but stay alert',
                'Never share sensitive information over calls',
                'Always verify before acting on requests',
            ];
        }
    };

    const fontSize = guardianMode ? 'text-xl' : 'text-base';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="bg-purple-100 rounded-full p-4">
                            <FileText className={`${guardianMode ? 'w-12 h-12' : 'w-8 h-8'} text-purple-600`} />
                        </div>
                    </div>
                    <h1 className={`font-bold ${guardianMode ? 'text-4xl' : 'text-3xl'} text-gray-900 mb-2`}>
                        {t('analyzeConversationText')}
                    </h1>
                    <p className={`${guardianMode ? 'text-xl' : 'text-base'} text-gray-600`}>
                        {t('analyzeDescription')}
                    </p>
                </motion.div>

                {/* Text Input */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-lg"
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('textPlaceholder')}
                        rows={guardianMode ? 10 : 8}
                        className={`w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${guardianMode ? 'text-xl' : 'text-base'
                            }`}
                    />

                    <Button
                        onClick={handleAnalyze}
                        disabled={!text.trim() || analyzing}
                        size="lg"
                        className={`w-full mt-4 bg-purple-600 hover:bg-purple-700 ${guardianMode ? 'text-xl py-6' : ''}`}
                    >
                        {analyzing ? (
                            <>
                                <Loader className={`${guardianMode ? 'w-6 h-6' : 'w-5 h-5'} mr-2 animate-spin`} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search className={`${guardianMode ? 'w-6 h-6' : 'w-5 h-5'} mr-2`} />
                                {t('analyzeButton')}
                            </>
                        )}
                    </Button>
                </motion.div>

                {/* Result */}
                {result && (
                    <>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-8 rounded-2xl border-2 ${getRiskBgColor(result.risk_label)}`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                {result.risk_label === 'HIGH' || result.risk_label === 'MEDIUM' ? (
                                    <AlertTriangle className={`${guardianMode ? 'w-16 h-16' : 'w-12 h-12'} ${getRiskColor(result.risk_label)}`} />
                                ) : (
                                    <CheckCircle className={`${guardianMode ? 'w-16 h-16' : 'w-12 h-12'} ${getRiskColor(result.risk_label)}`} />
                                )}
                                <div>
                                    <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-gray-600 mb-1`}>
                                        {t('result')}
                                    </p>
                                    <p className={`${guardianMode ? 'text-5xl' : 'text-3xl'} font-bold ${getRiskColor(result.risk_label)}`}>
                                        {result.risk_label === 'HIGH'
                                            ? t('highRisk')
                                            : result.risk_label === 'MEDIUM'
                                                ? t('suspicious')
                                                : result.risk_label === 'LOW'
                                                    ? t('suspicious')
                                                    : t('safe')}
                                    </p>
                                    <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-gray-600 mt-1`}>
                                        Score: {result.risk_score}/100
                                    </p>
                                </div>
                            </div>

                            <p className={`${guardianMode ? 'text-2xl' : 'text-lg'} text-gray-700 leading-relaxed`}>
                                {result.explanation}
                            </p>
                        </motion.div>

                        {/* Suggested Actions */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200"
                        >
                            <h2 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-xl'} text-blue-900 mb-4`}>
                                {t('suggestedAction')}
                            </h2>
                            <ul className="space-y-3">
                                {getActionAdvice().map((advice, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                        <p className={`${guardianMode ? 'text-xl' : 'text-base'} text-blue-900`}>{advice}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Analyze Another */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button
                                onClick={() => {
                                    setText('');
                                    setResult(null);
                                }}
                                variant="outline"
                                className={`w-full ${guardianMode ? 'text-xl py-6' : ''}`}
                            >
                                Analyze Another Conversation
                            </Button>
                        </motion.div>
                    </>
                )}

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: result ? 0.6 : 0.4 }}
                >
                    <Button
                        onClick={onBackHome}
                        variant="outline"
                        className={`w-full ${guardianMode ? 'text-xl py-6' : ''}`}
                    >
                        <Home className={`${guardianMode ? 'w-6 h-6' : 'w-5 h-5'} mr-2`} />
                        Back to Home
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
