'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Define the props for the WelcomeScreen component
interface WelcomeScreenProps {
    imageUrl: string;
    title: React.ReactNode;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
    secondaryActionText?: string;
    onSecondaryActionClick?: () => void;
    className?: string;
}

/**
 * A responsive and animated welcome screen component.
 * It uses framer-motion for animations and is styled with shadcn/ui theme variables.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    imageUrl,
    title,
    description,
    buttonText,
    onButtonClick,
    secondaryActionText,
    onSecondaryActionClick,
    className,
}) => {
    // Animation variants for the container and its children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const imageVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                duration: 0.8,
            },
        },
    };

    return (
        <div
            className={cn(
                'flex h-screen w-full flex-col items-center justify-between bg-background overflow-hidden',
                className
            )}
        >
            {/* Top Image Section with a curved clip-path */}
            <motion.div
                className="relative w-full h-[40vh]"
                initial="hidden"
                animate="visible"
                variants={imageVariants}
            >
                <img
                    src={imageUrl}
                    alt="Welcome"
                    className="h-full w-full object-cover"
                    style={{ clipPath: 'ellipse(100% 70% at 50% 30%)' }}
                />
            </motion.div>

            {/* Content Section */}
            <motion.div
                className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Title */}
                <motion.h1
                    className="text-3xl font-bold tracking-tight text-foreground md:text-5xl"
                    variants={itemVariants}
                >
                    {title}
                </motion.h1>

                {/* Description */}
                <motion.p
                    className="max-w-md text-muted-foreground text-lg"
                    variants={itemVariants}
                >
                    {description}
                </motion.p>
            </motion.div>

            {/* Actions Section */}
            <motion.div
                className="w-full space-y-4 p-8 pb-12"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Primary Button */}
                <motion.div variants={itemVariants}>
                    <Button onClick={onButtonClick} className="w-full h-14 text-lg rounded-2xl" size="lg">
                        {buttonText}
                    </Button>
                </motion.div>

                {/* Secondary Action Link */}
                {secondaryActionText && onSecondaryActionClick && (
                    <motion.div variants={itemVariants} className="text-center">
                        <Button
                            variant="link"
                            onClick={onSecondaryActionClick}
                            className="text-sm text-muted-foreground"
                        >
                            {secondaryActionText}
                        </Button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
