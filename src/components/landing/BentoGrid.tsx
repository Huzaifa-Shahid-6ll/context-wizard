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
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-none p-6 bg-black/40 border border-white/10 hover:border-white/20 justify-between flex flex-col space-y-4 backdrop-blur-md",
                className
            )}
            onClick={onClick}
        >
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex-col space-y-2">
                {header}
            </div>
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon}
                <div className="font-sans font-bold text-neutral-200 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-400 text-sm leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
