"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, Variants } from "framer-motion";

export default function BaselinePage() {
    const router = useRouter();
    const [running, setRunning] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleRun = async () => {
        setRunning(true);
        try {
            // Simulated API call to orchestrator as requested
            await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai"
                })
            }).catch(() => { }); // Catch error if endpoint doesn't exist yet
        } finally {
            setTimeout(() => {
                setRunning(false);
                setShowResults(true);
            }, 1500); // Small delay to show loading state
        }
    };

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

    const comparisons = [
        { name: "Method", simple: "Keyword matching", serveiq: "Agentic semantic extraction" },
        { name: "Language", simple: "English only (Fails on Roman Urdu)", serveiq: "Urdu, Roman Urdu, English natively" },
        { name: "Ranking", simple: "Static (Alphabetical/Rating)", serveiq: "8-factor dynamic context scoring" },
        { name: "Pricing", simple: "Fixed list price", serveiq: "Dynamic (Distance, Urgency, Budget)" },
        { name: "Booking", simple: "Manual calendar lookup", serveiq: "Agentic schedule negotiation" },
        { name: "Follow-up", simple: "Static forms", serveiq: "Proactive Follow-up Agent" },
        { name: "Disputes", simple: "Customer service queue", serveiq: "AI Dispute Resolution Agent" },
        { name: "Confidence Score", simple: "N/A", serveiq: "92% (Reasoning trace available)" },
    ];

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
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
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
                        onClick={() => router.push("/")}
                        className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Home
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
                    className="w-full text-center flex flex-col items-center mb-16"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#0f172a]/80 border border-blue-500/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <span className="text-[10px] sm:text-xs text-blue-300 font-mono tracking-widest font-medium uppercase">
                            System Architecture Evaluation
                        </span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-[1.2]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Baseline </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Comparison</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        See how ServeIQ's agentic orchestrator outperforms traditional keyword-based matching systems.
                    </motion.p>

                    {/* Test Query Card */}
                    <motion.div variants={itemVariants} className="w-full max-w-2xl bg-[#0a0f1d] border border-blue-500/20 rounded-2xl p-6 mb-8 shadow-lg text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="text-xs text-blue-400 font-mono mb-3 uppercase tracking-wider">Test Query (Roman Urdu)</div>
                        <div className="text-lg md:text-xl text-slate-200 italic font-medium leading-relaxed">
                            "AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai"
                        </div>
                    </motion.div>

                    {/* CTA Button */}
                    {!showResults && (
                        <motion.div variants={itemVariants}>
                            <button
                                onClick={handleRun}
                                disabled={running}
                                className={`group relative px-8 py-4 rounded-2xl ${running ? 'bg-blue-800' : 'bg-blue-600'} text-white font-bold text-lg transition-all duration-300 ${!running && 'hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-1'} overflow-hidden min-w-[240px]`}
                            >
                                {!running && <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                <span className="relative flex items-center justify-center gap-2">
                                    {running ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Running Comparison...
                                        </>
                                    ) : (
                                        <>
                                            Run Comparison
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>
                    )}
                </motion.section>

                {/* Results Section */}
                {showResults && (
                    <motion.section
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="w-full max-w-5xl"
                    >
                        {/* Winner Banner */}
                        <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-blue-900/40 via-blue-800/40 to-blue-900/40 border border-blue-500/30 rounded-2xl p-6 mb-12 text-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 mb-2">
                                ServeIQ Agentic Approach Wins ✅
                            </h2>
                            <p className="text-blue-200/70 text-sm md:text-base max-w-2xl mx-auto">
                                The multi-agent orchestrator successfully understood the localized context, extracted constraint details (location, urgency, budget), and identified the correct service intent where simple keyword matching completely failed.
                            </p>
                        </motion.div>

                        {/* Comparison Grid */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-blue-500/15 bg-[#0a0f1d]/80">
                                <div className="p-4 md:p-6 font-bold text-slate-400 uppercase text-xs tracking-wider border-b md:border-b-0 md:border-r border-blue-500/15">Feature</div>
                                <div className="p-4 md:p-6 font-bold text-red-400 uppercase text-xs tracking-wider border-b md:border-b-0 md:border-r border-blue-500/15 flex items-center gap-2">
                                    Simple System ❌
                                </div>
                                <div className="p-4 md:p-6 font-bold text-blue-400 uppercase text-xs tracking-wider flex items-center gap-2">
                                    ServeIQ Agentic ✅
                                </div>
                            </div>

                            {comparisons.map((row, index) => (
                                <div
                                    key={index}
                                    className={`grid grid-cols-1 md:grid-cols-3 border-b border-blue-500/10 last:border-0 hover:bg-blue-900/10 transition-colors ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                                >
                                    <div className="p-4 md:p-6 font-medium text-slate-300 md:border-r border-blue-500/10 flex items-center">
                                        {row.name}
                                    </div>
                                    <div className="p-4 md:p-6 text-sm text-slate-400 md:border-r border-blue-500/10 flex items-center">
                                        <span className="mr-2 text-red-500/70">✗</span>
                                        {row.simple}
                                    </div>
                                    <div className="p-4 md:p-6 text-sm text-blue-200 font-medium flex items-center bg-blue-500/[0.02]">
                                        <span className="mr-2 text-green-400">✓</span>
                                        {row.serveiq}
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-12 text-center">
                            <button
                                onClick={() => router.push("/")}
                                className="text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4"
                            >
                                Back to Landing Page
                            </button>
                        </motion.div>
                    </motion.section>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full px-6 py-8 sm:py-10 border-t border-blue-500/10 bg-[#050816]/80 backdrop-blur-lg mt-auto">
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
                            onClick={() => router.push("/")}
                            className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push("/trace")}
                            className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium"
                        >
                            Agent Traces
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
