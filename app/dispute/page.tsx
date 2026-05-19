"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const DISPUTE_TYPES = [
    { id: "quality_complaint", label: "Poor Quality", icon: "😤", desc: "Service not done properly" },
    { id: "no_show", label: "No Show", icon: "🚫", desc: "Provider didn't arrive" },
    { id: "price_disagreement", label: "Price Dispute", icon: "💸", desc: "Charged more than quoted" },
    { id: "cancellation", label: "Cancellation", icon: "❌", desc: "Provider cancelled last minute" },
    { id: "overrun", label: "Time Overrun", icon: "⏰", desc: "Took much longer than estimated" },
];

function DisputeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedType, setSelectedType] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);

    const bookingData = (() => {
        try { return JSON.parse(decodeURIComponent(searchParams.get("booking") || "{}")); }
        catch { return { booking_id: "SIQ-DEMO-001" }; }
    })();

    const providerData = (() => {
        try { return JSON.parse(decodeURIComponent(searchParams.get("provider") || "{}")); }
        catch { return { name: "Ustad Ahmed", rating: 4.8, cancellation_rate: 2, risk_score: 5 }; }
    })();

    const pricingData = (() => {
        try { return JSON.parse(decodeURIComponent(searchParams.get("pricing") || "{}")); }
        catch { return { price_breakdown: { final_price: 2893 } }; }
    })();

    const submitDispute = async () => {
        if (!selectedType || !description) return;
        setLoading(true);
        try {
            const res = await fetch("/api/agents/dispute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking: bookingData,
                    provider: providerData,
                    serviceType: bookingData.service || "AC Repair",
                    pricingData,
                    disputeType: selectedType,
                    disputeDescription: description,
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-blue-500/10 bg-[#050816]/80 backdrop-blur-md sticky top-0">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors text-sm">
                            ← Back
                        </button>
                        <div className="w-px h-5 bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">S</span>
                            </div>
                            <span className="font-bold text-white">ServeIQ</span>
                        </div>
                    </div>
                    <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        ⚖️ Dispute Center
                    </span>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-black text-white mb-2">
                        ⚖️ Dispute <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Center</span>
                    </h1>
                    <p className="text-slate-400 text-sm">AI-powered fair dispute resolution for both parties</p>
                </motion.div>

                {!result ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-5"
                    >
                        {/* Booking Info */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Booking Details</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Booking ID", value: bookingData.booking_id || "SIQ-DEMO-001" },
                                    { label: "Provider", value: providerData.name || "Ustad Ahmed" },
                                    { label: "Provider Rating", value: `⭐ ${providerData.rating || 4.8}` },
                                    { label: "Amount Paid", value: `PKR ${pricingData?.price_breakdown?.final_price || 2893}` },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between text-sm">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white font-mono text-xs">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Dispute Type Selection */}
                        <motion.div variants={itemVariants}>
                            <h3 className="font-bold text-white mb-3">What went wrong?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {DISPUTE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-4 rounded-2xl border text-left transition-all ${selectedType === type.id
                                            ? "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                                            : "border-white/10 bg-white/5 hover:border-red-500/30"
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className="font-bold text-white text-sm">{type.label}</div>
                                        <div className="text-xs text-slate-400 mt-1">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div variants={itemVariants}>
                            <h3 className="font-bold text-white mb-3">Describe the issue</h3>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us exactly what happened in detail..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-red-500/40 transition-colors"
                            />
                        </motion.div>

                        {/* AI Note */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                </span>
                                <span className="text-xs text-blue-400 font-mono uppercase tracking-wider">AI Resolution Engine</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Our Dispute Agent analyzes your complaint against the provider's historical performance,
                                cancellation rate, risk score, and evidence to make a fair decision for both parties.
                            </p>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants}>
                            <button
                                onClick={submitDispute}
                                disabled={!selectedType || !description || loading}
                                className="w-full group relative py-4 rounded-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative text-white font-black text-lg">
                                    {loading ? "🤖 AI Analyzing Dispute..." : "Submit Dispute"}
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>
                ) : (
                    // Resolution Screen
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-5"
                    >
                        {/* Resolution Header */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-[#0f172a]/50 border border-green-500/20 rounded-2xl p-5 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl">
                                    ✅
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Dispute Resolved</h3>
                                    <p className="text-xs text-slate-400 font-mono">{String(result.dispute_id)}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Severity */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">Investigation Summary</h3>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${result.severity === "high"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : result.severity === "medium"
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : "bg-green-500/20 text-green-400 border-green-500/30"
                                    }`}>
                                    {String(result.severity).toUpperCase()} SEVERITY
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">User Claim</p>
                                    <p className="text-slate-300">{String((result.investigation as Record<string, unknown>)?.user_claim)}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Provider History</p>
                                    <p className="text-slate-300">{String((result.investigation as Record<string, unknown>)?.provider_history)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Confidence</span>
                                    <span className="text-blue-400 font-bold">{String((result.investigation as Record<string, unknown>)?.confidence_in_resolution)}%</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decision */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-4">Resolution Decision</h3>
                            <div className="space-y-3">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Decision</p>
                                    <p className="text-white text-sm">{String((result.resolution as Record<string, unknown>)?.decision)}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Action Taken</p>
                                    <p className="text-white text-sm">{String((result.resolution as Record<string, unknown>)?.action_taken)}</p>
                                </div>
                                {Number((result.resolution as Record<string, unknown>)?.refund_amount) > 0 && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                        <p className="text-[10px] text-green-400 uppercase mb-1">Refund Approved</p>
                                        <p className="text-green-300 font-black text-2xl">
                                            PKR {String((result.resolution as Record<string, unknown>)?.refund_amount)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Provider Status */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-3">Provider Action</h3>
                            <p className="text-sm text-slate-300 mb-3">{String((result.resolution as Record<string, unknown>)?.provider_penalty)}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${(result.blacklist_check as Record<string, unknown>)?.provider_blacklisted
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-green-500/20 text-green-400 border-green-500/30"
                                    }`}>
                                    {(result.blacklist_check as Record<string, unknown>)?.provider_blacklisted ? "⛔ Blacklisted" : "✓ Not Blacklisted"}
                                </span>
                                <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${(result.escalation as Record<string, unknown>)?.escalated_to_human
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    }`}>
                                    {(result.escalation as Record<string, unknown>)?.escalated_to_human ? "👤 Human Escalated" : "🤖 Auto-Resolved"}
                                </span>
                            </div>
                        </motion.div>

                        {/* Message to User */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-3">Message to You</h3>
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-sm text-slate-300 italic">
                                    "{String((result.notification as Record<string, unknown>)?.user_message)}"
                                </p>
                            </div>
                        </motion.div>

                        {/* Future Prevention */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-2 text-sm">🔮 Future Prevention</h3>
                            <p className="text-xs text-slate-400">{String(result.future_prevention)}</p>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push("/")}
                                className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:border-blue-500/40 transition-colors"
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => router.push("/chatbot")}
                                className="group relative py-4 rounded-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700" />
                                <span className="relative text-white font-bold">Book Again</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function DisputePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>}>
            <DisputeContent />
        </Suspense>
    );
}