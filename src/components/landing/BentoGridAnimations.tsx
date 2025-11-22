import React from "react";
import { motion } from "framer-motion";
import { Check, Terminal, LayoutTemplate, Shield, Blocks, Rocket } from "lucide-react";

export const WizardAnimation = () => {
    const items = [
        "Select App Type",
        "Choose Stack",
        "Define Features",
        "Generate Prompts",
    ];

    return (
        <div className="relative w-full h-full flex flex-col justify-center px-4 overflow-hidden">
            <div className="space-y-2">
                {items.map((item, i) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            delay: i * 0.5,
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 3,
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                delay: i * 0.5 + 0.2,
                                duration: 0.3,
                                repeat: Infinity,
                                repeatDelay: 3.2,
                            }}
                        >
                            <Check className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                        <span className="text-sm text-neutral-300 font-mono">{item}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export const PromptAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-[90%] bg-black/80 rounded-lg border border-white/10 p-3 font-mono text-xs text-neutral-400 shadow-2xl">
                <div className="flex gap-1.5 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
                <div className="space-y-1">
                    <div className="flex gap-2">
                        <span className="text-emerald-500">➜</span>
                        <span>generate_app</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-blue-400"
                    >
                        Analyzing requirements...
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                        className="text-purple-400"
                    >
                        Creating database schema...
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 2.5 }}
                        className="text-emerald-400"
                    >
                        ✓ Prompts ready
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-2 h-4 bg-white/50 inline-block align-middle ml-1"
                    />
                </div>
            </div>
        </div>
    );
};

export const TemplatesAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="grid grid-cols-2 gap-3 rotate-12 scale-110 opacity-80">
                {[1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-24 h-24 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center"
                    >
                        <LayoutTemplate className="w-8 h-8 text-white/40" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export const SecurityAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="relative">
                <motion.div
                    animate={{
                        boxShadow: [
                            "0 0 0 0px rgba(16, 185, 129, 0)",
                            "0 0 0 20px rgba(16, 185, 129, 0.1)",
                            "0 0 0 40px rgba(16, 185, 129, 0)",
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"
                >
                    <Shield className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <motion.div
                    className="absolute -inset-1 border border-emerald-500/30 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute -inset-3 border border-dashed border-emerald-500/20 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </div>
    );
};

export const NonDevAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="relative w-32 h-32">
                <motion.div
                    className="absolute top-0 left-0 w-14 h-14 bg-blue-500/20 rounded-lg border border-blue-500/30 flex items-center justify-center"
                    animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Blocks className="w-6 h-6 text-blue-400" />
                </motion.div>
                <motion.div
                    className="absolute bottom-0 right-0 w-14 h-14 bg-purple-500/20 rounded-lg border border-purple-500/30 flex items-center justify-center"
                    animate={{ x: [0, -20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <Terminal className="w-6 h-6 text-purple-400" />
                </motion.div>
                <motion.div
                    className="absolute top-0 right-0 w-12 h-12 bg-pink-500/20 rounded-full border border-pink-500/30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
};

export const DeploymentAnimation = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-8">
            <div className="w-full h-1 bg-white/10 rounded-full relative">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="relative">
                        <Rocket className="w-6 h-6 text-white rotate-45 transform -translate-y-1/2 -translate-x-1/2" />
                        <motion.div
                            className="absolute top-1/2 left-0 w-8 h-1 bg-blue-500 blur-sm -translate-x-full"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </div>
            <div className="absolute bottom-8 left-8 text-xs text-neutral-500 font-mono">Idea</div>
            <div className="absolute bottom-8 right-8 text-xs text-neutral-500 font-mono">Production</div>
        </div>
    );
};
