'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/translations';
import { useVoiceShield } from '@/lib/store';
import { Button } from './button';

export function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { selectedLanguage, setLanguage } = useVoiceShield();

    const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="gap-2"
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang?.nativeName}</span>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">Choose your language</h2>
                                <p className="text-sm text-gray-600 mt-1">Select your preferred language for the app</p>
                            </div>

                            {/* Language Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <motion.button
                                            key={lang.code}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setIsOpen(false);
                                            }}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedLanguage === lang.code
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-lg">{lang.nativeName}</p>
                                                    <p className="text-sm text-gray-600">{lang.name}</p>
                                                </div>
                                                {selectedLanguage === lang.code && (
                                                    <Check className="w-6 h-6 text-blue-600" />
                                                )}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200">
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full"
                                >
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
