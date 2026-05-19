"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface Provider {
    id: string;
    name: string;
    specialization: string;
    location: { area: string; city: string };
    rating: number;
    on_time_score: number;
    cancellation_rate: number;
    experience_years: number;
    hourly_rate: number;
    visit_fee: number;
    review_sentiment: string;
    certifications: string[];
    tools_available: string[];
    languages: string[];
    phone: string;
    complexity_level: string[];
    availability: Record<string, string[]>;
    total_reviews: number;
    recent_reviews: number;
    risk_score: number;
    reliability_score: number;
    scores: {
        total_score: string;
        rating_score: string;
        reliability_score: string;
        experience_score: string;
        budget_score: string;
        cancellation_score: string;
    };
    rank: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const MOCK_PROVIDER: Provider = {
    id: "P001",
    name: "Ustad Ahmed",
    specialization: "AC & HVAC",
    location: { area: "G-13", city: "Islamabad" },
    rating: 4.8,
    on_time_score: 94,
    cancellation_rate: 2,
    experience_years: 12,
    hourly_rate: 1500,
    visit_fee: 500,
    review_sentiment: "positive",
    certifications: ["HVAC Certified", "Gas Handling"],
    tools_available: ["pressure gauge", "vacuum pump", "gas cylinders"],
    languages: ["Urdu", "Punjabi"],
    phone: "+92-300-1234567",
    complexity_level: ["basic", "intermediate", "complex"],
    availability: {
        monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        tuesday: ["09:00", "10:00", "14:00"],
        wednesday: ["09:00", "11:00", "15:00"],
        thursday: ["10:00", "14:00", "15:00"],
        friday: ["09:00", "11:00"],
        saturday: ["09:00", "10:00", "11:00"],
        sunday: []
    },
    total_reviews: 127,
    recent_reviews: 23,
    risk_score: 5,
    reliability_score: 96,
    scores: {
        total_score: "106",
        rating_score: "24",
        reliability_score: "18.8",
        experience_score: "9",
        budget_score: "10",
        cancellation_score: "14.7"
    },
    rank: 1
};

function ProviderDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [provider, setProvider] = useState<Provider>(MOCK_PROVIDER);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            const dataParam = searchParams.get("data");
            if (dataParam) {
                setProvider(JSON.parse(decodeURIComponent(dataParam)));
            }
        } catch (e) {
            setProvider(MOCK_PROVIDER);
        }
    }, [searchParams]);

    const today = new Date();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const tomorrow = days[(today.getDay() + 1) % 7];
    const availableSlots = provider.availability?.[tomorrow] || [];

    const handleBook = async () => {
        if (!selectedSlot) return;
        setLoading(true);
        try {
            const pricingRes = await fetch("/api/agents/pricing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    serviceType: provider.specialization,
                    urgency: "high",
                    budgetSensitivity: "medium",
                    preferredTime: selectedSlot,
                }),
            });
            const pricingData = await pricingRes.json();

            const bookingRes = await fetch("/api/agents/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    serviceType: provider.specialization,
                    preferredTime: selectedSlot,
                    location: provider.location.area,
                    pricingData,
                    urgency: "high",
                }),
            });
            const bookingData = await bookingRes.json();

            router.push(
                `/booking?booking=${encodeURIComponent(JSON.stringify(bookingData.booking))}&provider=${encodeURIComponent(JSON.stringify(provider))}&pricing=${encodeURIComponent(JSON.stringify(pricingData))}`
            );
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const scoreItems = [
        { label: "Rating Score", value: provider.scores?.rating_score, max: 25 },
        { label: "Reliability", value: provider.scores?.reliability_score, max: 20 },
        { label: "Cancellation", value: provider.scores?.cancellation_score, max: 15 },
        { label: "Experience", value: provider.scores?.experience_score, max: 15 },
        { label: "Budget Match", value: provider.scores?.budget_score, max: 15 },
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
                        Rank #{provider.rank}
                    </span>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Provider Hero */}
                    <motion.div variants={itemVariants} className="relative bg-[#0f172a]/50 border border-blue-500/15 rounded-3xl p-6 backdrop-blur-sm overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl font-black text-blue-400 flex-shrink-0">
                                {provider.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-black text-white">{provider.name}</h1>
                                        <p className="text-blue-400 font-medium">{provider.specialization}</p>
                                        <p className="text-slate-500 text-sm">📍 {provider.location?.area}, {provider.location?.city}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-500">
                                            {provider.scores?.total_score}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">AI Score</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {provider.certifications?.map((cert) => (
                                        <span key={cert} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                            ✓ {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Rating", value: `⭐ ${provider.rating}`, sub: `${provider.total_reviews} reviews`, color: "text-yellow-400" },
                            { label: "On-time Score", value: `${provider.on_time_score}%`, sub: "reliability", color: "text-green-400" },
                            { label: "Cancellation", value: `${provider.cancellation_rate}%`, sub: "rate", color: "text-red-400" },
                            { label: "Experience", value: `${provider.experience_years} yrs`, sub: "in field", color: "text-blue-400" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-4 text-center backdrop-blur-sm">
                                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                                <div className="text-[10px] text-slate-600">{stat.sub}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* AI Score Breakdown */}
                    <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-400">📊</span> AI Score Breakdown
                        </h3>
                        <div className="space-y-3">
                            {scoreItems.map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-blue-400 font-bold">{item.value}/{item.max}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(Number(item.value) / item.max) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Availability */}
                    <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-400">📅</span> Tomorrow's Available Slots
                        </h3>
                        {availableSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedSlot === slot
                                            ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                            : "bg-white/5 text-slate-300 border border-white/10 hover:border-blue-500/40"
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">No slots available tomorrow</p>
                        )}
                    </motion.div>

                    {/* Tools & Languages */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-4 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-3 text-sm">🔧 Tools</h3>
                            <div className="space-y-1">
                                {provider.tools_available?.map((tool) => (
                                    <p key={tool} className="text-xs text-slate-400">• {tool}</p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-4 backdrop-blur-sm">
                            <h3 className="font-bold text-white mb-3 text-sm">🌐 Languages</h3>
                            <div className="space-y-1">
                                {provider.languages?.map((lang) => (
                                    <p key={lang} className="text-xs text-slate-400">• {lang}</p>
                                ))}
                            </div>
                            <h3 className="font-bold text-white mb-2 mt-3 text-sm">📞 Contact</h3>
                            <p className="text-xs text-blue-400">{provider.phone}</p>
                        </div>
                    </motion.div>

                    {/* Pricing Preview */}
                    <motion.div variants={itemVariants} className="bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-400">💰</span> Pricing
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: "Hourly Rate", value: `PKR ${provider.hourly_rate}` },
                                { label: "Visit Fee", value: `PKR ${provider.visit_fee}` },
                                { label: "Estimated Total", value: `PKR ${provider.hourly_rate + provider.visit_fee}+` },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between text-sm">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="text-white font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Book Button */}
                    <motion.div variants={itemVariants}>
                        <button
                            onClick={handleBook}
                            disabled={!selectedSlot || loading}
                            className="w-full group relative py-4 rounded-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative text-white font-black text-lg flex items-center justify-center gap-2">
                                {loading ? "🤖 Processing Booking..." : selectedSlot ? `Book for ${selectedSlot} →` : "Select a Time Slot First"}
                            </span>
                        </button>
                        {!selectedSlot && (
                            <p className="text-center text-xs text-slate-500 mt-2">Please select an available time slot above</p>
                        )}
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

export default function ProviderDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>}>
            <ProviderDetailContent />
        </Suspense>
    );
}