"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

export default function LandingPage() {
    const router = useRouter();
    const [typed, setTyped] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const fullText = "AI Service Orchestrator for Pakistan's Informal Economy";

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < fullText.length) {
                setTyped(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 40);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const cursor = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(cursor);
    }, []);

    const features = [
        { icon: "🧠", title: "Intent Agent", desc: "Understands Urdu, Roman Urdu & English" },
        { icon: "🔍", title: "Discovery Agent", desc: "Finds best providers instantly" },
        { icon: "📊", title: "Ranking Agent", desc: "8-factor AI scoring algorithm" },
        { icon: "💰", title: "Pricing Agent", desc: "Dynamic transparent pricing" },
        { icon: "📅", title: "Booking Agent", desc: "Automated slot confirmation" },
        { icon: "📱", title: "Notification Agent", desc: "SMS & WhatsApp alerts" },
        { icon: "📋", title: "Follow-up Agent", desc: "Feedback & reputation update" },
        { icon: "⚖️", title: "Dispute Agent", desc: "AI-powered resolution" },
    ];

    const stats = [
        { value: "8", label: "AI Agents" },
        { value: "10+", label: "Providers" },
        { value: "6+", label: "Ranking Factors" },
        { value: "100%", label: "Agentic" },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden selection:bg-blue-500/30 font-sans flex flex-col">
            {/* Animated Background Gradients & Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] mix-blend-screen" />

                {/* Moving grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between border-b border-blue-500/10 bg-[#050816]/60 backdrop-blur-md"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="font-bold text-white text-xl tracking-tight">ServeIQ</span>
                    <span className="hidden sm:inline-flex text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 tracking-wider">
                        v1.0 Beta
                    </span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => router.push("/baseline")}
                        className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Baseline
                    </button>
                    <button
                        onClick={() => router.push("/trace")}
                        className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Traces
                    </button>
                    <button
                        onClick={() => router.push("/chatbot")}
                        className="group relative px-5 py-2.5 rounded-full overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative text-white text-sm font-semibold flex items-center gap-2">
                            Launch App
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </button>
                </div>
            </motion.header>

            <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 w-full max-w-6xl mx-auto flex-grow flex flex-col items-center">

                {/* Hero Section */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full text-center flex flex-col items-center mb-24"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#0f172a]/80 border border-blue-500/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        <span className="text-[10px] sm:text-xs text-blue-300 font-mono tracking-widest font-medium uppercase">
                            Powered by Google Antigravity
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.2] md:leading-[1.1]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Next-Gen AI </span>
                        <br className="sm:hidden" />
                        <span className="relative inline-block mt-2 sm:mt-0">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Orchestrator</span>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 blur-sm" />
                        </span>
                    </motion.h1>

                    {/* Typed text */}
                    <motion.div variants={itemVariants} className="h-16 md:h-8 flex items-center justify-center mb-10 px-4 w-full">
                        <p className="text-slate-400 text-sm md:text-lg font-mono text-center max-w-xl leading-relaxed">
                            {typed}
                            <span className={`${showCursor ? "opacity-100" : "opacity-0"} text-blue-500 inline-block w-2.5 h-4 md:h-5 align-middle ml-1 bg-blue-500`} />
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto justify-center">
                        <button
                            onClick={() => router.push("/chatbot")}
                            className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative flex items-center justify-center gap-2">
                                Try ServeIQ Now
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        </button>
                        <button
                            onClick={() => router.push("/baseline")}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-md"
                        >
                            View Baseline
                        </button>
                    </motion.div>
                </motion.section>

                {/* Stats */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                    className="w-full max-w-4xl mb-24"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="relative group bg-[#0f172a]/60 border border-blue-500/20 rounded-2xl p-6 text-center backdrop-blur-md hover:border-blue-400/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* How it works - Pipeline */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                    className="w-full max-w-5xl mb-24"
                >
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">8 Agents. One Seamless Pipeline.</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">Our multi-agent orchestrator breaks down complex intents and coordinates multiple specialized AI models in real-time.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group relative bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 hover:bg-[#0f172a]/80 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-300 blur-md"></div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                            {feature.icon}
                                        </div>
                                        <span className="text-4xl font-black text-slate-800 group-hover:text-blue-900/40 transition-colors">
                                            0{index + 1}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-base sm:text-lg mb-2">{feature.title}</h3>
                                    <p className="text-xs sm:text-sm text-slate-400 flex-grow">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Example scenario - Terminal */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                    className="w-full max-w-3xl mb-16"
                >
                    <div className="bg-[#0a0f1d] border border-blue-500/20 rounded-3xl overflow-hidden shadow-2xl relative">
                        {/* Terminal Header */}
                        <div className="bg-[#0f172a] px-4 py-3 border-b border-blue-500/10 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="flex-1 text-center flex justify-center items-center gap-2">
                                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">serveiq-orchestrator-node</span>
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="p-4 sm:p-6 md:p-8 font-mono text-xs sm:text-sm md:text-base">
                            <div className="mb-6">
                                <p className="text-blue-400 mb-2 flex items-center gap-2">
                                    <span className="text-blue-600">❯</span>
                                    <span className="text-slate-500">Incoming User Intent</span>
                                </p>
                                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 text-slate-200 italic leading-relaxed">
                                    "AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai"
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-blue-400 mb-4 flex items-center gap-2">
                                    <span className="text-blue-600">❯</span>
                                    <span className="text-slate-500">Processing Agents</span>
                                </p>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-slate-300 bg-blue-900/10 p-3 rounded-lg border border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-blue-200 font-semibold">Language:</span>
                                    </div>
                                    <span className="ml-5 sm:ml-0">Roman Urdu detected</span>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-slate-300 bg-blue-900/10 p-3 rounded-lg border border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-blue-200 font-semibold">Service:</span>
                                    </div>
                                    <span className="ml-5 sm:ml-0">AC Repair extracted</span>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-slate-300 bg-blue-900/10 p-3 rounded-lg border border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-blue-200 font-semibold">Provider:</span>
                                    </div>
                                    <div className="ml-5 sm:ml-0 flex items-center">
                                        Ustad Ahmed
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded ml-2 border border-blue-500/30">96/100</span>
                                    </div>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-slate-300 bg-blue-900/10 p-3 rounded-lg border border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">✓</span>
                                        <span className="text-blue-200 font-semibold">Price:</span>
                                    </div>
                                    <span className="ml-5 sm:ml-0">PKR 2,893 <span className="text-slate-500 ml-1 text-xs sm:text-sm">(budget alt: 2,459)</span></span>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-slate-300 bg-green-900/20 p-3 rounded-lg border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-green-300 font-semibold">Booking:</span>
                                    </div>
                                    <span className="ml-5 sm:ml-0 text-green-100">Confirmed for tomorrow 09:00</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f1d] to-transparent pointer-events-none opacity-50" />
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full px-6 py-8 sm:py-10 border-t border-blue-500/10 bg-[#050816]/80 backdrop-blur-lg">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-slate-400 font-medium mb-1">
                            ServeIQ — Google Antigravity Hackathon 2026
                        </p>
                        <p className="text-xs text-slate-500">
                            Built with Google Antigravity + Groq LLaMA 3.3
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        <button
                            onClick={() => router.push("/trace")}
                            className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium"
                        >
                            Agent Traces
                        </button>
                        <button
                            onClick={() => router.push("/baseline")}
                            className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium"
                        >
                            Baseline Compare
                        </button>
                        <button
                            onClick={() => router.push("/dispute")}
                            className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium"
                        >
                            Dispute Center
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}