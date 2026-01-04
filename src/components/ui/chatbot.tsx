'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { RiskLabel } from '@/lib/store';
import { Button } from './button';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatbotProps {
    riskLabel: RiskLabel;
    explanation: string;
    onClose?: () => void;
    language?: string;
}

export function Chatbot({ riskLabel, explanation, language = 'en' }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial AI message based on risk level
        const initialMessage = getInitialMessage(riskLabel, explanation);
        setMessages([{
            id: '1',
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date(),
        }]);
    }, [riskLabel, explanation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function getInitialMessage(risk: RiskLabel, exp: string): string {
        if (risk === 'HIGH') {
            return `🚨 **URGENT WARNING**\n\n${exp}\n\n**What to do RIGHT NOW:**\n• Hang up immediately\n• Do NOT share OTP, PIN, CVV, or passwords\n• If you already shared details, contact your bank immediately\n• Call the official bank number from their website\n\nAsk me anything about protecting yourself.`;
        } else if (risk === 'MEDIUM' || risk === 'LOW') {
            return `⚠️ **CAUTION ADVISED**\n\n${exp}\n\n**Safety tips:**\n• Never share OTP, PIN, CVV, or passwords\n• Verify caller identity through official channels\n• Banks never ask for credentials over phone\n\nI'm here to help - ask any questions!`;
        } else {
            return `✅ **Looking Safe So Far**\n\n${exp}\n\n**Stay vigilant:**\n• Never share OTP, PIN, CVV, or passwords\n• Even if caller seems legitimate, verify independently\n\nAsk me anything about scam protection!`;
        }
    }

    async function handleSend() {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response (in production, call backend API)
        setTimeout(() => {
            const aiResponse = generateResponse(input, riskLabel);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
            }]);
            setIsTyping(false);
        }, 1000);
    }

    function generateResponse(userInput: string, risk: RiskLabel): string {
        const lower = userInput.toLowerCase();

        // Common questions and responses
        if (lower.includes('scam') && lower.includes('definitely')) {
            if (risk === 'HIGH') {
                return '**Yes, this shows strong scam indicators.**\n\nThe patterns match known fraud tactics:\n• Asking for OTP/PIN/passwords\n• Creating urgency or fear\n• Impersonating authority\n\n**Action:** Hang up and report this number.';
            } else {
                return 'I cannot say for certain. But the conversation has some suspicious elements. Always verify through official channels - never trust caller ID alone.';
            }
        }

        if (lower.includes('already shared') || lower.includes('gave my otp')) {
            return '**Act IMMEDIATELY:**\n\n1. Call your bank from the official number\n2. Request to block/freeze your account\n3. Change all passwords\n4. Monitor transactions closely\n5. File a complaint with cyber cell\n\nTime is critical - do this NOW.';
        }

        if (lower.includes('report') || lower.includes('complain')) {
            return '**How to report:**\n\n1. **Cyber Cell:** cybercrime.gov.in or call 1930\n2. **Bank:** Use official customer care number\n3. **Telecom:** Report to your mobile operator\n4. **Police:** File FIR at nearest station\n\nSave all evidence (call logs, messages, screenshots).';
        }

        if (lower.includes('block') || lower.includes('stop')) {
            return '**To block this number:**\n\n1. Add to your phone\'s block list\n2. Report as spam in your dialer app\n3. Inform your telecom provider\n4. Use DND (Do Not Disturb) service\n\n**SMS "START 0" to 1909** for full DND.';
        }

        if (lower.includes('how') && lower.includes('work')) {
            return '**How scammers operate:**\n\n1. Get your number from data leaks\n2. Spoof caller ID (fake bank/police)\n3. Create panic (account blocked, KYC)\n4. Rush you to act without thinking\n5. Ask for OTP/PIN to "verify"\n6. Drain your account instantly\n\n**Remember:** Real banks NEVER ask for OTP/PIN.';
        }

        // Default helpful response
        return '**General Safety Rules:**\n\n✅ **NEVER share:** OTP, PIN, CVV, full card number, passwords\n✅ **Always verify:** Call official number from bank website\n✅ **Stay calm:** Scammers use urgency to make you panic\n✅ **Hang up if:** They ask for ANY sensitive info\n\nWhat else can I help with?';
    }

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 rounded-t-3xl shadow-2xl max-h-[60vh] flex flex-col"
        >
            {/* Header */}
            <div className={`p-4 border-b ${riskLabel === 'HIGH' ? 'bg-red-50 border-red-200' :
                    riskLabel === 'MEDIUM' ? 'bg-orange-50 border-orange-200' :
                        'bg-green-50 border-green-200'
                }`}>
                <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-blue-600" />
                    <div>
                        <h3 className="font-bold text-lg">VoiceShield Assistant</h3>
                        <p className="text-sm text-gray-600">
                            {riskLabel === 'HIGH' ? 'This call looks risky. I will guide you.' :
                                riskLabel === 'MEDIUM' ? 'Stay cautious. Let me help.' :
                                    'This looks safe, but let\'s stay careful.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString()}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-gray-400 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about this call or how to stay safe…"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="rounded-full w-12 h-12 p-0"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
