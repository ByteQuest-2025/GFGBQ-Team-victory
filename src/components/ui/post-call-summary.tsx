'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Shield, Phone, Home } from 'lucide-react';
import { Button } from './button';
import { useTranslations } from '@/lib/translations';
import { useVoiceShield, RiskLabel } from '@/lib/store';

interface PostCallSummaryProps {
    onBackHome: () => void;
}

export function PostCallSummary({ onBackHome }: PostCallSummaryProps) {
    const {
        selectedLanguage,
        currentRisk,
        currentTranscript,
        endCall,
        guardianMode,
    } = useVoiceShield();

    const t = useTranslations(selectedLanguage);

    if (!currentRisk) {
        return null;
    }

    const getRiskColor = (label: RiskLabel) => {
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

    const getRiskBgColor = (label: RiskLabel) => {
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

    const getRedFlags = () => {
        const flags: string[] = [];
        currentRisk.triggers.forEach(trigger => {
            if (trigger === 'REQUEST_OTP') {
                flags.push('Request for OTP or PIN over the phone');
            }
            if (trigger === 'REQUEST_UPI_PIN') {
                flags.push('Request for UPI PIN or bank password');
            }
            if (trigger === 'IMPERSONATION_BANK') {
                flags.push('Impersonation of bank or government official');
            }
            if (trigger === 'URGENCY_PRESSURE') {
                flags.push('Threats or urgency tactics (account will be blocked, legal action, etc.)');
            }
            if (trigger === 'REMOTE_ACCESS_APP') {
                flags.push('Request to install remote access apps');
            }
            if (trigger === 'URGENCY_SCAM') {
                flags.push('Mentions of prizes, lottery, or urgent refunds');
            }
        });
        return flags.length > 0 ? flags : ['No major red flags detected'];
    };

    const getAdvice = () => {
        if (currentRisk.risk_label === 'HIGH') {
            return [
                'Do NOT share OTP, PIN, CVV, or passwords with anyone, even if they claim to be from the bank',
                'Call the official bank customer care number from the bank\'s website or your bank app',
                'If you shared any details, immediately block your card or freeze your account',
                'Report this number to cybercrime.gov.in or call 1930',
            ];
        } else if (currentRisk.risk_label === 'MEDIUM' || currentRisk.risk_label === 'LOW') {
            return [
                'Be cautious. Verify the caller\'s identity through official channels',
                'Never share OTP, PIN, CVV, or passwords over phone',
                'If unsure, hang up and call the official number yourself',
                'Report suspicious numbers to your telecom provider',
            ];
        } else {
            return [
                'Even though this call looks safe, never share OTP, PIN, or passwords',
                'Always verify important requests independently',
                'Stay vigilant for any unusual requests',
            ];
        }
    };

    const handleFeedback = (isScam: boolean) => {
        endCall(isScam);
        onBackHome();
    };

    const fontSize = guardianMode ? 'text-xl' : 'text-base';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center"
                >
                    <h1 className={`font-bold ${guardianMode ? 'text-4xl' : 'text-3xl'} text-gray-900 mb-2`}>
                        {t('callSummary')}
                    </h1>
                    <p className={`${guardianMode ? 'text-xl' : 'text-base'} text-gray-600`}>
                        {t('summarySubtitle')}
                    </p>
                </motion.div>

                {/* Risk Result Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-8 rounded-2xl border-2 ${getRiskBgColor(currentRisk.risk_label)}`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        {currentRisk.risk_label === 'HIGH' || currentRisk.risk_label === 'MEDIUM' ? (
                            <AlertTriangle className={`${guardianMode ? 'w-16 h-16' : 'w-12 h-12'} ${getRiskColor(currentRisk.risk_label)}`} />
                        ) : (
                            <CheckCircle className={`${guardianMode ? 'w-16 h-16' : 'w-12 h-12'} ${getRiskColor(currentRisk.risk_label)}`} />
                        )}
                        <div>
                            <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-gray-600 mb-1`}>
                                {t('finalRiskLevel')}
                            </p>
                            <p className={`${guardianMode ? 'text-5xl' : 'text-3xl'} font-bold ${getRiskColor(currentRisk.risk_label)}`}>
                                {currentRisk.risk_label === 'HIGH'
                                    ? t('highRisk')
                                    : currentRisk.risk_label === 'MEDIUM'
                                        ? t('suspicious')
                                        : currentRisk.risk_label === 'LOW'
                                            ? t('suspicious')
                                            : t('safe')}
                            </p>
                            <p className={`${guardianMode ? 'text-lg' : 'text-sm'} text-gray-600 mt-1`}>
                                Score: {currentRisk.risk_score}/100
                            </p>
                        </div>
                    </div>

                    <p className={`${guardianMode ? 'text-2xl' : 'text-lg'} text-gray-700 leading-relaxed`}>
                        {currentRisk.explanation}
                    </p>
                </motion.div>

                {/* Key Red Flags */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl shadow-lg"
                >
                    <h2 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-xl'} text-gray-900 mb-4`}>
                        {t('keyRedFlags')}
                    </h2>
                    <ul className="space-y-3">
                        {getRedFlags().map((flag, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2" />
                                <p className={`${guardianMode ? 'text-xl' : 'text-base'} text-gray-700`}>{flag}</p>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* What To Do Next */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200"
                >
                    <h2 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-xl'} text-blue-900 mb-4`}>
                        {t('whatToDoNext')}
                    </h2>
                    <ul className="space-y-3">
                        {getAdvice().map((advice, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                                <p className={`${guardianMode ? 'text-xl' : 'text-base'} text-blue-900`}>{advice}</p>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* User Feedback */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white p-6 rounded-2xl shadow-lg"
                >
                    <h2 className={`font-bold ${guardianMode ? 'text-3xl' : 'text-xl'} text-gray-900 mb-4`}>
                        {t('wasThisScam')}
                    </h2>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => handleFeedback(true)}
                            className={`flex-1 bg-red-600 hover:bg-red-700 ${guardianMode ? 'text-xl py-6' : ''}`}
                        >
                            {t('yesScam')}
                        </Button>
                        <Button
                            onClick={() => handleFeedback(false)}
                            variant="outline"
                            className={`flex-1 ${guardianMode ? 'text-xl py-6' : ''}`}
                        >
                            {t('noLegitimate')}
                        </Button>
                    </div>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
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
