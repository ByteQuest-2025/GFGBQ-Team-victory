'use client';

import { motion } from 'framer-motion';
import { Mic, Network, Shield, Check } from 'lucide-react';
import { Button } from './button';
import { useTranslations } from '@/lib/translations';
import { useVoiceShield } from '@/lib/store';

interface PermissionsScreenProps {
    onAllowPermissions: () => void;
}

export function PermissionsScreen({ onAllowPermissions }: PermissionsScreenProps) {
    const { selectedLanguage } = useVoiceShield();
    const t = useTranslations(selectedLanguage);

    const permissions = [
        {
            icon: Mic,
            title: t('micPermission'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            icon: Network,
            title: t('networkPermission'),
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <div className="bg-white rounded-full p-6 shadow-lg">
                        <Shield className="w-16 h-16 text-green-600" />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('privacyTitle')}
                    </h1>
                    <p className="text-gray-600">
                        {t('privacyBody')}
                    </p>
                </motion.div>

                {/* What We Need */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {t('whatWeNeed')}
                    </h2>

                    <div className="space-y-3">
                        {permissions.map((perm, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm"
                            >
                                <div className={`flex-shrink-0 w-12 h-12 ${perm.bgColor} rounded-full flex items-center justify-center`}>
                                    <perm.icon className={`w-6 h-6 ${perm.color}`} />
                                </div>
                                <p className="text-gray-700 pt-2">{perm.title}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button
                        onClick={onAllowPermissions}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
                    >
                        <Check className="mr-2 w-5 h-5" />
                        {t('allowPermissions')}
                    </Button>
                </motion.div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-sm text-gray-500 mt-6"
                >
                    {t('disableAnytime')}
                </motion.p>
            </div>
        </div>
    );
}
