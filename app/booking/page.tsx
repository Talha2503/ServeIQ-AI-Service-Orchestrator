"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

function BookingConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingData, setBookingData] = useState<any>(null);
    const [providerData, setProviderData] = useState<any>(null);
    const [pricingData, setPricingData] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        setIsChecking(true);
        try {
            // Try sessionStorage first (from services page)
            const sessionBooking = sessionStorage.getItem("serveiq_booking");
            const sessionProvider = sessionStorage.getItem("serveiq_provider");
            const sessionPricing = sessionStorage.getItem("serveiq_pricing");

            if (sessionBooking) {
                setBookingData(JSON.parse(sessionBooking));
                if (sessionProvider) setProviderData(JSON.parse(sessionProvider));
                if (sessionPricing) setPricingData(JSON.parse(sessionPricing));
                setIsChecking(false);
                return;
            }

            // Try URL params (from chatbot)
            const bookingParam = searchParams.get("booking");
            const providerParam = searchParams.get("provider");
            const pricingParam = searchParams.get("pricing");
            const dataParam = searchParams.get("data");

            if (bookingParam) {
                try { setBookingData(JSON.parse(decodeURIComponent(bookingParam))); }
                catch { setBookingData(null); }
            } else if (dataParam) {
                try { setBookingData(JSON.parse(decodeURIComponent(dataParam))); }
                catch { setBookingData(null); }
            }

            if (providerParam) {
                try { setProviderData(JSON.parse(decodeURIComponent(providerParam))); }
                catch { setProviderData(null); }
            }

            if (pricingParam) {
                try { setPricingData(JSON.parse(decodeURIComponent(pricingParam))); }
                catch { setPricingData(null); }
            }

        } catch (e) {
            console.error("Failed to parse booking data", e);
        } finally {
            setIsChecking(false);
        }
    }, [searchParams]);
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const notifications = [
        { label: "SMS Confirmation Sent", icon: "✅" },
        { label: "WhatsApp Notification Sent", icon: "✅" },
        { label: "24h Reminder Scheduled", icon: "✅" },
        { label: "1h Reminder Scheduled", icon: "✅" },
        { label: "En-route Alert Scheduled", icon: "✅" },
    ];

    if (isChecking) return null;

    // Extract data from correct structure
    const provider = providerData || bookingData?.provider;
    const bookingId = bookingData?.booking_id || bookingData?.id || "SIQ-PENDING";
    const service = bookingData?.service || provider?.specialization || "Service";
    const date = bookingData?.date || bookingData?.datetime || "Tomorrow";
    const time = bookingData?.time || "09:00";
    const location = bookingData?.location || "Requested Location";
    const finalPrice = pricingData?.price_breakdown?.final_price || bookingData?.price || "Calculated";

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden font-sans flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between border-b border-blue-500/10 bg-[#050816]/60 backdrop-blur-md"
            >
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="font-bold text-white text-xl">ServeIQ</span>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-[#0f172a]/80 px-4 py-2 rounded-full border border-blue-500/20"
                >
                    ← Back
                </button>
            </motion.header>

            <main className="relative z-10 pt-28 pb-20 px-4 w-full max-w-4xl mx-auto flex-grow flex flex-col items-center">
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full flex flex-col items-center"
                >
                    {!bookingData ? (
                        // No Booking State
                        <div className="flex flex-col items-center justify-center text-center py-20">
                            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#0f172a] border border-blue-500/20 mb-8">
                                <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </motion.div>
                            <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-black text-white mb-4">
                                No Active Booking
                            </motion.h1>
                            <motion.p variants={itemVariants} className="text-slate-400 text-lg mb-10 max-w-md">
                                You don't have an active booking yet. Start a conversation to find the right service professional.
                            </motion.p>
                            <motion.div variants={itemVariants}>
                                <button
                                    onClick={() => router.push("/services")}
                                    className="group relative px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative flex items-center gap-2">
                                        Book a Service →
                                    </span>
                                </button>
                            </motion.div>
                        </div>
                    ) : (
                        <>
                            {/* Success Header */}
                            <motion.div variants={itemVariants} className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <motion.svg
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.8 }}
                                        className="w-10 h-10 text-green-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
                                    Booking Confirmed!
                                </h1>
                                <p className="text-slate-400">Your service has been successfully scheduled.</p>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-8">
                                {/* Receipt Card */}
                                <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#0a0f1d] border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />

                                    {/* Booking ID */}
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-500/10">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Booking ID</p>
                                            <p className="font-mono text-blue-300 font-bold">{bookingId}</p>
                                        </div>
                                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 font-bold">
                                            ✓ Confirmed
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Provider</p>
                                            <p className="font-bold text-white text-lg">{provider?.name || "Assigned Provider"}</p>
                                            <p className="text-sm text-slate-400">{provider?.specialization || "Service Professional"}</p>
                                            <p className="text-sm text-blue-400 mt-1">{provider?.phone || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Service</p>
                                            <p className="font-medium text-slate-200">{service}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date</p>
                                            <p className="font-medium text-slate-200">{date}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time</p>
                                            <p className="font-medium text-slate-200">{time}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                                            <p className="font-medium text-slate-200">{location}</p>
                                        </div>
                                        {pricingData?.budget_alternative && (
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Budget Alternative</p>
                                                <p className="font-medium text-blue-400">PKR {pricingData.budget_alternative}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Breakdown */}
                                    {pricingData?.price_breakdown && (
                                        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Price Breakdown</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-slate-400">
                                                    <span>Base Cost</span>
                                                    <span>PKR {pricingData.price_breakdown.base_service_cost}</span>
                                                </div>
                                                {pricingData.price_breakdown.urgency_adjustment > 0 && (
                                                    <div className="flex justify-between text-orange-400">
                                                        <span>Urgency</span>
                                                        <span>+PKR {pricingData.price_breakdown.urgency_adjustment}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-slate-400">
                                                    <span>Visit Fee</span>
                                                    <span>PKR {pricingData.price_breakdown.visit_fee}</span>
                                                </div>
                                                <div className="flex justify-between text-green-400">
                                                    <span>Loyalty Discount</span>
                                                    <span>PKR {pricingData.price_breakdown.loyalty_discount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Final Price */}
                                    <div className="flex justify-between items-center pt-4 border-t border-blue-500/10">
                                        <p className="text-slate-400 font-medium">Final Price</p>
                                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                                            PKR {finalPrice}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Notifications */}
                                <motion.div variants={itemVariants} className="lg:col-span-1 bg-[#0f172a]/50 border border-blue-500/15 rounded-3xl p-6 backdrop-blur-sm h-fit">
                                    <h3 className="text-lg font-bold text-white mb-5">📱 Notifications</h3>
                                    <div className="space-y-4">
                                        {notifications.map((notif, index) => (
                                            <div key={index} className="flex items-center gap-3 text-sm">
                                                <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs border border-green-500/30">
                                                    {notif.icon}
                                                </span>
                                                <span className="text-slate-300">{notif.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Provider certifications */}
                                    {provider?.certifications?.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-blue-500/10">
                                            <p className="text-xs text-slate-500 uppercase mb-3">Certifications</p>
                                            <div className="flex flex-wrap gap-2">
                                                {provider.certifications.map((cert: string) => (
                                                    <span key={cert} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                                        ✓ {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Action Buttons */}
                            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <button
                                    onClick={() => router.push(
                                        `/followup?booking=${encodeURIComponent(JSON.stringify(bookingData))}&provider=${encodeURIComponent(JSON.stringify(provider))}&pricing=${encodeURIComponent(JSON.stringify(pricingData))}`
                                    )}
                                    className="group relative p-4 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10">📋 Track Service</span>
                                </button>
                                <button
                                    onClick={() => router.push("/trace")}
                                    className="p-4 rounded-2xl bg-[#0f172a]/80 border border-blue-500/20 text-slate-300 font-semibold text-sm hover:bg-[#1e293b] hover:text-white transition-all hover:-translate-y-1"
                                >
                                    🤖 Agent Trace
                                </button>
                                <button
                                    onClick={() => router.push(
                                        `/dispute?booking=${encodeURIComponent(JSON.stringify(bookingData))}&provider=${encodeURIComponent(JSON.stringify(provider))}&pricing=${encodeURIComponent(JSON.stringify(pricingData))}`
                                    )}
                                    className="p-4 rounded-2xl bg-[#0f172a]/80 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-all hover:-translate-y-1"
                                >
                                    ⚖️ Report Issue
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all hover:-translate-y-1"
                                >
                                    🏠 Home
                                </button>
                            </motion.div>
                        </>
                    )}
                </motion.section>
            </main>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-slate-400 font-mono text-sm">Loading receipt...</span>
                </div>
            </div>
        }>
            <BookingConfirmationContent />
        </Suspense>
    );
}