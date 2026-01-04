'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import { RiskLabel } from '@/lib/store';

interface RiskFlagProps {
    riskLabel: RiskLabel;
    show: boolean;
    message?: string;
}

export function RiskFlag({ riskLabel, show, message }: RiskFlagProps) {
    if (!show) return null;

    const isGreen = riskLabel === 'SAFE' || riskLabel === 'LOW';
    const isRed = riskLabel === 'HIGH';

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        rotate: isRed ? [0, -5, 5, -5, 5, 0] : [0, 2, -2, 2, 0],
                    }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{
                        duration: 0.6,
                        rotate: {
                            duration: 0.5,
                            repeat: isRed ? 2 : 1,
                        }
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                    <div className="relative">
                        {/* Glow effect */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className={`absolute inset-0 rounded-full blur-3xl ${isGreen ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />

                        {/* Main flag */}
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className={`relative flex flex-col items-center justify-center w-64 h-64 rounded-full ${isGreen
                                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                                    : 'bg-gradient-to-br from-red-500 to-red-700'
                                } shadow-2xl`}
                        >
                            {isGreen ? (
                                <Shield className="w-32 h-32 text-white" strokeWidth={2.5} />
                            ) : (
                                <AlertTriangle className="w-32 h-32 text-white" strokeWidth={2.5} />
                            )}

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 text-2xl font-bold text-white text-center px-4"
                            >
                                {isGreen ? 'Caller looks safe' : 'Danger: Possible Scam'}
                            </motion.p>

                            {message && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-2 text-sm text-white/90 text-center px-6"
                                >
                                    {message}
                                </motion.p>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Persistent risk badge that shows after animation
interface RiskBadgeProps {
    riskLabel: RiskLabel;
    riskScore: number;
    className?: string;
}

export function RiskBadge({ riskLabel, riskScore, className = '' }: RiskBadgeProps) {
    const colors = {
        SAFE: 'bg-green-500/20 text-green-700 border-green-500',
        LOW: 'bg-yellow-500/20 text-yellow-700 border-yellow-500',
        MEDIUM: 'bg-orange-500/20 text-orange-700 border-orange-500',
        HIGH: 'bg-red-500/20 text-red-700 border-red-500',
    };

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 ${colors[riskLabel]} ${className}`}
        >
            <div className="flex items-center gap-2">
                {riskLabel === 'SAFE' || riskLabel === 'LOW' ? (
                    <Shield className="w-6 h-6" />
                ) : (
                    <AlertTriangle className="w-6 h-6" />
                )}
                <div>
                    <p className="font-bold text-lg">{riskLabel}</p>
                    <p className="text-sm opacity-80">Risk Score: {riskScore}/100</p>
                </div>
            </div>
        </motion.div>
    );
}
