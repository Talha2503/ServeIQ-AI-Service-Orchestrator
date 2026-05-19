"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

const SERVICES = [
    { id: "ac_repair", label: "AC Repair", emoji: "🌡️" },
    { id: "plumber", label: "Plumber", emoji: "🔧" },
    { id: "electrician", label: "Electrician", emoji: "⚡" },
    { id: "carpenter", label: "Carpenter", emoji: "🪚" },
    { id: "house_cleaning", label: "House Cleaning", emoji: "🧹" },
    { id: "car_mechanic", label: "Car Mechanic", emoji: "🚗" },
    { id: "driver", label: "Driver", emoji: "🚙" },
    { id: "tutor", label: "Tutor", emoji: "📚" },
    { id: "beautician", label: "Beautician", emoji: "💄" },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

type Step = "select" | "details" | "providers" | "pricing";

export default function ServicesPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("select");
    const [selectedService, setSelectedService] = useState<(typeof SERVICES)[0] | null>(null);
    const [location, setLocation] = useState("");
    const [time, setTime] = useState("Morning");
    const [urgency, setUrgency] = useState("Medium");
    const [budgetSensitivity, setBudgetSensitivity] = useState("Medium");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [providers, setProviders] = useState<any[]>([]);
    const [workflowState, setWorkflowState] = useState<any>(null);
    const [pricing, setPricing] = useState<any>(null);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    const handleServiceSelect = (svc: (typeof SERVICES)[0]) => {
        setSelectedService(svc);
        setStep("details");
    };

    const handleFindProviders = async () => {
        if (!location.trim()) { setError("Please enter a location."); return; }
        setError("");
        setLoading(true);
        const userInput = `I need ${selectedService!.label} in ${location} ${time}, budget ${budgetSensitivity}, urgency ${urgency}`;
        try {
            const res = await fetch("/api/orchestrator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "process_intent", payload: { userInput }, state: null }),
            });
            const data = await res.json();
            if (data.error) { setError(data.error); return; }
            setWorkflowState(data.state);
            if (data.nextStep === "select_provider") {
                setProviders(data.state.ranking.rankedProviders || []);
                setStep("providers");
            } else {
                setError(data.message || "No providers found. Try a different location.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProvider = async (provider: any) => {
        setSelectedProvider(provider);
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/orchestrator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "get_pricing", payload: { provider }, state: workflowState }),
            });
            const data = await res.json();
            setWorkflowState(data.state);
            setPricing(data.pricing);
            setStep("pricing");
        } catch {
            setError("Error fetching pricing.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/orchestrator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "confirm_booking", payload: {}, state: workflowState }),
            });
            const data = await res.json();

            const bookingResult = data.booking?.booking;
            const providerResult = selectedProvider;
            const pricingResult = pricing;

            if (bookingResult) {
                // Store in sessionStorage instead of URL params
                sessionStorage.setItem("serveiq_booking", JSON.stringify(bookingResult));
                sessionStorage.setItem("serveiq_provider", JSON.stringify(providerResult));
                sessionStorage.setItem("serveiq_pricing", JSON.stringify(pricingResult));
                router.push("/booking");
            } else {
                setError(data.booking?.message || "Booking failed. Please try again.");
            }
        } catch (e) {
            console.error("Booking error:", e);
            setError("Error confirming booking.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/chatbot")}
                        className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
                    >
                        Try Chatbot
                    </button>
                    <button
                        onClick={() => router.push("/trace")}
                        className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
                    >
                        Traces
                    </button>
                </div>
            </motion.header>

            <main className="relative z-10 pt-28 pb-20 px-4 md:px-8 w-full max-w-5xl mx-auto">
                {/* Step Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-10 justify-center"
                >
                    {(["select", "details", "providers", "pricing"] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s
                                    ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                                    : ["select", "details", "providers", "pricing"].indexOf(step) > i
                                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/40"
                                        : "bg-white/5 text-slate-600 border border-white/10"
                                    }`}
                            >
                                {i + 1}
                            </div>
                            {i < 3 && <div className={`w-8 h-px ${["select", "details", "providers", "pricing"].indexOf(step) > i ? "bg-blue-500/50" : "bg-white/10"}`} />}
                        </div>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Service Selection */}
                    {step === "select" && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">What do you need?</h1>
                                <p className="text-slate-400">Select a service category to get started</p>
                            </div>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                            >
                                {SERVICES.map((svc) => (
                                    <motion.button
                                        key={svc.id}
                                        variants={itemVariants}
                                        onClick={() => handleServiceSelect(svc)}
                                        className="group relative bg-[#0f172a]/60 border border-blue-500/15 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-blue-400/50 hover:bg-[#0f172a]/90 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300 backdrop-blur-sm text-center overflow-hidden"
                                    >
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-300 blur-md" />
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{svc.emoji}</span>
                                        <span className="font-semibold text-white text-sm relative z-10">{svc.label}</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* STEP 2: Location & Details */}
                    {step === "details" && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                            className="max-w-lg mx-auto"
                        >
                            <div className="text-center mb-8">
                                <span className="text-5xl mb-3 block">{selectedService?.emoji}</span>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{selectedService?.label}</h1>
                                <p className="text-slate-400 text-sm">Tell us more so we can find the best match</p>
                            </div>

                            <div className="bg-[#0a0f1d] border border-blue-500/20 rounded-3xl p-6 space-y-5 shadow-xl">
                                {/* Location */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">📍 Location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. G-13, Islamabad"
                                        className="w-full bg-white/5 border border-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                    />
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">🕐 Preferred Time</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["Morning", "Afternoon", "Evening"].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTime(t)}
                                                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${time === t
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                                                    : "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-white"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Urgency */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">⚡ Urgency</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["High", "Medium", "Low"].map((u) => (
                                            <button
                                                key={u}
                                                onClick={() => setUrgency(u)}
                                                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${urgency === u
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                                                    : "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-white"
                                                    }`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">💰 Budget Sensitivity</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["High", "Medium", "Low"].map((b) => (
                                            <button
                                                key={b}
                                                onClick={() => setBudgetSensitivity(b)}
                                                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${budgetSensitivity === b
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                                                    : "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-white"
                                                    }`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={() => { setStep("select"); setError(""); }}
                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold text-sm hover:bg-white/10 transition-all"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleFindProviders}
                                        disabled={loading}
                                        className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Finding Providers...
                                            </>
                                        ) : "Find Providers →"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Provider List */}
                    {step === "providers" && (
                        <motion.div
                            key="providers"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">🏆 Ranked Providers</h1>
                                <p className="text-slate-400 text-sm">AI-scored matches for {selectedService?.label} in {location}</p>
                            </div>

                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4 max-w-2xl mx-auto"
                            >
                                {providers.map((provider, idx) => (
                                    <motion.div
                                        key={provider.id || idx}
                                        variants={itemVariants}
                                        className="group bg-[#0a0f1d] border border-blue-500/20 rounded-2xl p-5 hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                                                    <span className="font-bold text-white text-lg">{provider.name}</span>
                                                </div>
                                                <p className="text-slate-400 text-sm mt-0.5">{provider.specialization || selectedService?.label}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-yellow-400 font-bold">⭐ {provider.rating}</div>
                                                {provider.scores?.total_score && (
                                                    <div className="text-xs text-blue-400 mt-1">AI Score: {provider.scores.total_score}/100</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="bg-white/5 rounded-xl p-2 text-center">
                                                <div className="text-green-400 font-bold text-sm">{provider.on_time_score}%</div>
                                                <div className="text-slate-500 text-xs">On-time</div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-2 text-center">
                                                <div className="text-red-400 font-bold text-sm">{provider.cancellation_rate}%</div>
                                                <div className="text-slate-500 text-xs">Cancel</div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-2 text-center">
                                                <div className="text-blue-400 font-bold text-sm">{provider.experience_years}yr</div>
                                                <div className="text-slate-500 text-xs">Exp.</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">PKR {provider.hourly_rate}/hr</span>
                                            <button
                                                onClick={() => handleSelectProvider(provider)}
                                                disabled={loading}
                                                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all disabled:opacity-60"
                                            >
                                                {loading && selectedProvider?.id === provider.id ? "Loading..." : "Select →"}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <div className="text-center mt-6">
                                <button onClick={() => setStep("details")} className="text-slate-400 hover:text-white text-sm transition-colors">
                                    ← Change details
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Pricing & Confirm */}
                    {step === "pricing" && pricing && (
                        <motion.div
                            key="pricing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                            className="max-w-lg mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">💰 Price Estimate</h1>
                                <p className="text-slate-400 text-sm">For {selectedProvider?.name} · {selectedService?.label}</p>
                            </div>

                            <div className="bg-[#0a0f1d] border border-blue-500/20 rounded-3xl p-6 shadow-xl space-y-4">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-3xl" />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Base Cost</span>
                                        <span>PKR {pricing.price_breakdown?.base_service_cost}</span>
                                    </div>
                                    {pricing.price_breakdown?.urgency_adjustment > 0 && (
                                        <div className="flex justify-between text-orange-400">
                                            <span>Urgency</span>
                                            <span>+PKR {pricing.price_breakdown.urgency_adjustment}</span>
                                        </div>
                                    )}
                                    {pricing.price_breakdown?.surge_adjustment > 0 && (
                                        <div className="flex justify-between text-red-400">
                                            <span>Surge</span>
                                            <span>+PKR {pricing.price_breakdown.surge_adjustment}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-400">
                                        <span>Visit Fee</span>
                                        <span>PKR {pricing.price_breakdown?.visit_fee}</span>
                                    </div>
                                    {pricing.price_breakdown?.loyalty_discount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Loyalty Discount</span>
                                            <span>-PKR {pricing.price_breakdown.loyalty_discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white font-bold text-base border-t border-blue-500/20 pt-3 mt-2">
                                        <span>Final Price</span>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                                            PKR {pricing.price_breakdown?.final_price}
                                        </span>
                                    </div>
                                    {pricing.budget_alternative && (
                                        <div className="flex justify-between text-blue-400 text-xs">
                                            <span>Budget Alternative</span>
                                            <span>PKR {pricing.budget_alternative}</span>
                                        </div>
                                    )}
                                </div>

                                {pricing.fairness_note && (
                                    <p className="text-xs text-slate-500 italic border-l-2 border-blue-500/40 pl-3 leading-relaxed">
                                        {pricing.fairness_note}
                                    </p>
                                )}

                                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep("providers")}
                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold text-sm hover:bg-white/10 transition-all"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={loading}
                                        className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Confirming...
                                            </>
                                        ) : "✅ Confirm & Book"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
