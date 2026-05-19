"use client";
import { useEffect, useState, Suspense } from "react";
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

function FollowupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [serviceStatus, setServiceStatus] = useState("in_progress");

    const bookingData = (() => {
        try { return JSON.parse(decodeURIComponent(searchParams.get("booking") || "{}")); }
        catch { return {}; }
    })();

    const providerData = (() => {
        try { return JSON.parse(decodeURIComponent(searchParams.get("provider") || "{}")); }
        catch { return { name: "Ustad Ahmed", specialization: "AC & HVAC", phone: "+92-300-1234567" }; }
    })();

    const pricingData = (() => {
        try { return JSON.parse(decodeURIComponent(searchParams.get("pricing") || "{}")); }
        catch { return {}; }
    })();

    const submitFollowup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/agents/followup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking: bookingData,
                    provider: providerData,
                    serviceType: bookingData.service || providerData.specialization || "AC Repair",
                    pricingData,
                }),
            });
            const data = await res.json();
            setResult(data);
            setServiceStatus("completed");
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const steps = [
        { id: 1, label: "Booking Confirmed", status: "done", icon: "✅", time: bookingData.time || "09:00" },
        { id: 2, label: "Reminder Sent", status: "done", icon: "📱", time: "1 hr before" },
        { id: 3, label: "Provider En Route", status: "done", icon: "🚗", time: "30 min before" },
        { id: 4, label: "Service In Progress", status: serviceStatus === "completed" ? "done" : "active", icon: "🔧", time: "Now" },
        { id: 5, label: "Service Completed", status: serviceStatus === "completed" ? "done" : "pending", icon: "🏁", time: "" },
        { id: 6, label: "Feedback Submitted", status: result ? "done" : "pending", icon: "⭐", time: "" },
    ];

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
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
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        Service Follow-up
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
                        📋 Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Follow-up</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Track your service and submit feedback</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                >
                    {/* Provider Info */}
                    <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl font-black text-blue-400">
                                {providerData.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{providerData.name || "Provider"}</h3>
                                <p className="text-xs text-slate-400">{providerData.specialization || "Service Provider"}</p>
                                <p className="text-xs text-blue-400 mt-1">{providerData.phone || "+92-xxx-xxxxxxx"}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-5">Service Timeline</h3>
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="relative flex items-center gap-4">
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-5 top-10 w-0.5 h-6 bg-blue-500/20" />
                                    )}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all ${step.status === "done"
                                            ? "bg-green-500/20 border border-green-500/30"
                                            : step.status === "active"
                                                ? "bg-blue-500/20 border border-blue-500/30 animate-pulse"
                                                : "bg-white/5 border border-white/10"
                                        }`}>
                                        {step.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${step.status === "done" ? "text-white" :
                                                step.status === "active" ? "text-blue-400" :
                                                    "text-slate-600"
                                            }`}>{step.label}</p>
                                        {step.time && <p className="text-xs text-slate-500">{step.time}</p>}
                                    </div>
                                    {step.status === "done" && <span className="text-green-400 text-xs font-bold">✓</span>}
                                    {step.status === "active" && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Checklist */}
                    {!result && (
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-4">✅ Completion Checklist</h3>
                            <div className="space-y-3">
                                {[
                                    "Provider arrived on time",
                                    "Work area cleaned up after service",
                                    "Service tested and confirmed working",
                                    "Payment collected successfully",
                                    "Photo evidence captured"
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-md border border-green-500/40 bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-green-400 text-xs">✓</span>
                                        </div>
                                        <span className="text-sm text-slate-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Rating */}
                    {!result && (
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-4">⭐ Rate Your Experience</h3>
                            <div className="flex gap-3 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-4xl transition-all hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-slate-700"}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <textarea
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with the provider..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
                            />
                        </motion.div>
                    )}

                    {/* Submit or Result */}
                    {!result ? (
                        <motion.div variants={itemVariants}>
                            <button
                                onClick={submitFollowup}
                                disabled={loading}
                                className="w-full group relative py-4 rounded-2xl overflow-hidden disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700" />
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative text-white font-black text-lg">
                                    {loading ? "🤖 Processing Follow-up..." : "Submit & Complete Service"}
                                </span>
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Result Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#0f172a]/50 border border-green-500/20 rounded-2xl p-5 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">
                                        ✅
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Service Completed!</h3>
                                        <p className="text-xs text-slate-400">Follow-up agent processed successfully</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">New Rating</p>
                                        <p className="text-yellow-400 font-bold">⭐ {String((result.reputation_update as Record<string, unknown>)?.new_rating || "4.8")}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Reviews</p>
                                        <p className="text-white font-bold">{String((result.reputation_update as Record<string, unknown>)?.total_reviews || "128")}</p>
                                    </div>
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                                    <p className="text-xs text-slate-400 italic">{String(result.followup_sms || "Shukriya! Service complete ho gayi.")}</p>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-2 gap-3"
                            >
                                <button
                                    onClick={() => router.push(`/dispute?booking=${searchParams.get("booking") || ""}&provider=${searchParams.get("provider") || ""}&pricing=${searchParams.get("pricing") || ""}`)}
                                    className="py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                                >
                                    ⚖️ Report Issue
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="group relative py-3 rounded-2xl overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700" />
                                    <span className="relative text-white font-bold text-sm">Done ✓</span>
                                </button>
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

export default function FollowupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>}>
            <FollowupContent />
        </Suspense>
    );
}