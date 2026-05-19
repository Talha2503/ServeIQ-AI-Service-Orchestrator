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
    scores: {
        total_score: string;
        rating_score: string;
        reliability_score: string;
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

const MOCK_PROVIDERS: Provider[] = [
    {
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
        scores: { total_score: "106", rating_score: "24", reliability_score: "18.8" },
        rank: 1
    },
    {
        id: "P008",
        name: "CoolAir Technicians",
        specialization: "AC & HVAC",
        location: { area: "G-15", city: "Islamabad" },
        rating: 3.9,
        on_time_score: 71,
        cancellation_rate: 15,
        experience_years: 4,
        hourly_rate: 1200,
        visit_fee: 400,
        review_sentiment: "mixed",
        certifications: [],
        scores: { total_score: "86", rating_score: "19.5", reliability_score: "14.2" },
        rank: 2
    }
];

function ProvidersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [serviceType, setServiceType] = useState("AC Repair");
    const [location, setLocation] = useState("G-13");
    const [rankingExplanation, setRankingExplanation] = useState(
        "Ustad Ahmed ranked #1 due to superior reliability score (96%), 12 years experience, and only 2% cancellation rate despite higher hourly rate."
    );

    useEffect(() => {
        try {
            const dataParam = searchParams.get("data");
            if (dataParam) {
                const parsed = JSON.parse(decodeURIComponent(dataParam));
                setProviders(parsed.rankedProviders || MOCK_PROVIDERS);
                setServiceType(parsed.serviceType || "AC Repair");
                setLocation(parsed.location || "G-13");
                setRankingExplanation(parsed.ranking_explanation || rankingExplanation);
            } else {
                setProviders(MOCK_PROVIDERS);
            }
        } catch (e) {
            setProviders(MOCK_PROVIDERS);
        }
    }, [searchParams]);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    const getSentimentColor = (sentiment: string) => {
        if (sentiment === "positive") return "text-green-400";
        if (sentiment === "mixed") return "text-yellow-400";
        return "text-red-400";
    };

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
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                        >
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
                    <div className="text-xs text-slate-400 font-mono">
                        {serviceType} • {location}
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-black text-white mb-2">
                        Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Providers</span>
                    </h1>
                    <p className="text-slate-400 text-sm">{providers.length} providers ranked by AI scoring algorithm</p>
                </motion.div>

                {/* AI Reasoning Banner */}
                {rankingExplanation && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-[#0f172a]/80 border border-blue-500/20 rounded-2xl backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                            </span>
                            <span className="text-xs text-blue-400 font-mono uppercase tracking-wider">AI Ranking Reasoning</span>
                        </div>
                        <p className="text-sm text-slate-300">{rankingExplanation}</p>
                    </motion.div>
                )}

                {/* Provider Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {providers.map((provider) => (
                        <motion.div
                            key={provider.id}
                            variants={itemVariants}
                            onClick={() => router.push(`/provider/${provider.id}?data=${encodeURIComponent(JSON.stringify(provider))}`)}
                            className="group relative bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl p-5 hover:border-blue-400/40 transition-all duration-300 cursor-pointer backdrop-blur-sm overflow-hidden"
                        >
                            {/* Hover glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-10 transition duration-300 blur-md" />

                            {/* Top line on hover */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                {/* Header Row */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl font-black text-blue-400">
                                            {provider.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{provider.name}</h3>
                                                <span className="text-xl">{getRankBadge(provider.rank)}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">{provider.specialization}</p>
                                            <p className="text-xs text-slate-500">📍 {provider.location.area}, {provider.location.city}</p>
                                        </div>
                                    </div>

                                    {/* AI Score */}
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-500">
                                            {provider.scores?.total_score}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">AI Score</div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {[
                                        { label: "Rating", value: `⭐ ${provider.rating}`, color: "text-yellow-400" },
                                        { label: "On-time", value: `${provider.on_time_score}%`, color: "text-green-400" },
                                        { label: "Cancel", value: `${provider.cancellation_rate}%`, color: "text-red-400" },
                                        { label: "Exp.", value: `${provider.experience_years}yr`, color: "text-blue-400" },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
                                            <div className={`font-bold text-sm ${stat.color}`}>{stat.value}</div>
                                            <div className="text-[10px] text-slate-500">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price & Action */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-white font-bold">PKR {provider.hourly_rate}/hr</span>
                                        <span className="text-slate-500 text-xs ml-2">+ PKR {provider.visit_fee} visit fee</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${getSentimentColor(provider.review_sentiment)}`}>
                                            ● {provider.review_sentiment}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/provider/${provider.id}?data=${encodeURIComponent(JSON.stringify(provider))}`);
                                            }}
                                            className="group/btn relative px-4 py-2 rounded-xl overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700" />
                                            <span className="relative text-white text-sm font-bold flex items-center gap-1">
                                                View & Book
                                                <svg className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Certifications */}
                                {provider.certifications?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {provider.certifications.map((cert) => (
                                            <span key={cert} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                ✓ {cert}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
}

export default function ProvidersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>}>
            <ProvidersContent />
        </Suspense>
    );
}