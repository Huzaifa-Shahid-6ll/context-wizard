import React from "react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    onClick,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300 justify-between flex flex-col space-y-4 cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 flex-col items-center justify-center">
                {header}
            </div>
            <div className="mt-4">
                <div className="mb-3 flex items-center gap-3">
                    {icon}
                </div>
                <div className="font-sans font-semibold text-white mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-white/60 text-sm leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
