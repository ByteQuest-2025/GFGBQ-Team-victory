'use client';

import { motion } from 'framer-motion';
import { Shield, Mic, Network, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { useTranslations } from '@/lib/translations';
import { useVoiceShield } from '@/lib/store';

interface SplashScreenProps {
    onGetStarted: () => void;
}

export function SplashScreen({ onGetStarted }: SplashScreenProps) {
    const { selectedLanguage } = useVoiceShield();
    const t = useTranslations(selectedLanguage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                }}
                className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"
            />

            <div className="relative z-10 max-w-lg w-full">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-50"
                        />
                        <div className="relative bg-white rounded-full p-6">
                            <Shield className="w-16 h-16 text-blue-600" strokeWidth={2} />
                        </div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-4"
                >
                    <h1 className="text-4xl font-bold mb-2">{t('welcomeTitle')}</h1>
                    <p className="text-xl text-blue-100">{t('welcomeSubtitle')}</p>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 mb-8"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2" />
                        <p className="text-lg text-blue-50">{t('welcomeBullet1')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2" />
                        <p className="text-lg text-blue-50">{t('welcomeBullet2')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2" />
                        <p className="text-lg text-blue-50">{t('welcomeBullet3')}</p>
                    </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Button
                        onClick={onGetStarted}
                        size="lg"
                        className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg py-6"
                    >
                        {t('getStarted')}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>

                {/* Learn More */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-6"
                >
                    <button className="text-blue-100 underline text-sm">
                        {t('learnMore')}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
