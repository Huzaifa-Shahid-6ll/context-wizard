import React from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TestimonialCardProps {
    name: string;
    role: string;
    company?: string;
    quote: string;
    avatarUrl: string;
    customerStory?: string;
    logo?: string;
    className?: string;
}

export function TestimonialCard({
    name,
    role,
    company,
    quote,
    avatarUrl,
    customerStory,
    logo,
    className,
}: TestimonialCardProps) {
    // Simple logic to highlight the first sentence or part of it
    const firstSentenceEnd = quote.indexOf('.') + 1;
    const highlightedText = firstSentenceEnd > 0 ? quote.substring(0, firstSentenceEnd) : quote;
    const remainingText = firstSentenceEnd > 0 ? quote.substring(firstSentenceEnd) : '';

    return (
        <div
            className={cn(
                'relative flex w-full break-inside-avoid flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md transition-all hover:bg-white/[0.04]',
                // Glow effect
                'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                'shadow-[0_-1px_10px_rgba(255,255,255,0.02)]',
                className
            )}
        >
            <div className="mb-6">
                <p className="text-base leading-relaxed text-gray-400">
                    <span className="bg-white/10 text-white font-semibold px-1 py-0.5 rounded box-decoration-clone leading-loose">{highlightedText}</span>
                    {remainingText}
                </p>
            </div>

            {/* Inner Card for User Info */}
            <div className="mt-auto rounded-xl border border-white/5 bg-white/5 p-3 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-gray-800">
                    <Image
                        src={avatarUrl}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-white truncate">{name}</h4>
                    <p className="text-xs text-gray-400 truncate">
                        {role} {company && `@ ${company}`}
                    </p>
                </div>
                {(logo || customerStory) && (
                    <div className="ml-auto pl-2 border-l border-white/10 flex flex-col items-end justify-center">
                        {logo && (
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                                {logo}
                            </span>
                        )}
                        {customerStory && !logo && (
                            <span className="text-[10px] font-medium text-emerald-400/80">
                                Story
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
