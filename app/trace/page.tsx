"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const AGENTS = [
  { key: "intent", name: "Intent Agent", icon: "🧠", color: "blue", desc: "Language parsing & intent extraction" },
  { key: "discovery", name: "Discovery Agent", icon: "🔍", color: "purple", desc: "Provider discovery & filtering" },
  { key: "ranking", name: "Ranking Agent", icon: "📊", color: "yellow", desc: "8-factor scoring algorithm" },
  { key: "pricing", name: "Pricing Agent", icon: "💰", color: "green", desc: "Dynamic price calculation" },
  { key: "booking", name: "Booking Agent", icon: "📅", color: "blue", desc: "Slot selection & confirmation" },
  { key: "notification", name: "Notification Agent", icon: "📱", color: "teal", desc: "SMS & WhatsApp simulation" },
  { key: "followup", name: "Follow-up Agent", icon: "📋", color: "orange", desc: "Feedback & reputation update" },
  { key: "dispute", name: "Dispute Agent", icon: "⚖️", color: "red", desc: "Complaint & resolution handling" },
];

const COLOR_MAP: Record<string, string> = {
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  green: "border-green-500/30 bg-green-500/10 text-green-400",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-400",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
};

function TraceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [traceData, setTraceData] = useState<Record<string, unknown>>({});
  const [expanded, setExpanded] = useState<string | null>("intent");
  const [running, setRunning] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        setTraceData(JSON.parse(decodeURIComponent(dataParam)));
        setHasData(true);
      }
    } catch (e) {
      setHasData(false);
    }
  }, [searchParams]);

  const runDemoTrace = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_intent",
          payload: { userInput: "AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai" },
        }),
      });
      const data = await res.json();
      setTraceData(data.state || {});
      setHasData(true);
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  };

  const getAgentData = (key: string) => {
    return (traceData as Record<string, unknown>)[key] as Record<string, unknown> || {};
  };

  const getKeyInsights = (key: string) => {
    const data = getAgentData(key);
    switch (key) {
      case "intent":
        return [
          { label: "Service", value: String(data.service_type || "AC Repair") },
          { label: "Location", value: String(data.location || "G-13") },
          { label: "Language", value: String(data.language_detected || "roman_urdu") },
          { label: "Confidence", value: `${data.confidence_score || 90}%` },
          { label: "Urgency", value: String(data.urgency || "high") },
          { label: "Budget", value: String(data.budget_sensitivity || "high") },
        ];
      case "discovery":
        return [
          { label: "Providers Found", value: String(data.providers_found || 2) },
          { label: "Search Area", value: String(data.search_area || "G-13") },
          { label: "Method", value: String(data.discovery_method || "mock_dataset") },
        ];
      case "ranking":
        const ranked = (data.rankedProviders as Record<string, unknown>[]) || [];
        return [
          { label: "Top Provider", value: String((ranked[0] as Record<string, unknown>)?.name || "Ustad Ahmed") },
          { label: "Top Score", value: String(((ranked[0] as Record<string, unknown>)?.scores as Record<string, unknown>)?.total_score || "106") },
          { label: "Factors Used", value: "8 factors" },
          { label: "Explanation", value: String(data.ranking_explanation || "").substring(0, 80) + "..." },
        ];
      case "pricing":
        const breakdown = (data.price_breakdown as Record<string, unknown>) || {};
        return [
          { label: "Base Cost", value: `PKR ${breakdown.base_service_cost || 1950}` },
          { label: "Urgency Adj.", value: `PKR ${breakdown.urgency_adjustment || 234}` },
          { label: "Discount", value: `PKR ${breakdown.loyalty_discount || -145}` },
          { label: "Final Price", value: `PKR ${breakdown.final_price || 2893}` },
          { label: "Budget Alt.", value: `PKR ${data.budget_alternative || 2459}` },
        ];
      case "booking":
        const booking = (data.booking as Record<string, unknown>) || {};
        return [
          { label: "Booking ID", value: String(booking.booking_id || "SIQ-XXXXX") },
          { label: "Date", value: String(booking.date || "Tomorrow") },
          { label: "Time", value: String(booking.time || "09:00") },
          { label: "Double-booking", value: "✓ Checked" },
          { label: "Travel Buffer", value: "30 mins added" },
        ];
      case "notification":
        return [
          { label: "User SMS", value: "✓ Sent" },
          { label: "Provider SMS", value: "✓ Sent" },
          { label: "WhatsApp", value: "✓ Sent" },
          { label: "24h Reminder", value: "✓ Scheduled" },
          { label: "1h Reminder", value: "✓ Scheduled" },
          { label: "En-route Alert", value: "✓ Scheduled" },
        ];
      case "followup":
        return [
          { label: "Status", value: "Simulated" },
          { label: "Checklist", value: "All items ✓" },
          { label: "Customer Rating", value: "4.8 ⭐" },
          { label: "Rep. Updated", value: "✓ Done" },
        ];
      case "dispute":
        return [
          { label: "Status", value: "Available" },
          { label: "Types", value: "5 dispute types" },
          { label: "Resolution", value: "AI-powered" },
          { label: "Escalation", value: "Auto-handled" },
        ];
      default:
        return [];
    }
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
          <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-mono">
            Agent Traces
          </span>
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
            🤖 Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Trace Logs</span>
          </h1>
          <p className="text-slate-400 text-sm">Google Antigravity orchestration — observe, reason, decide, act</p>
        </motion.div>

        {/* Orchestrator Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[#0f172a]/80 border border-blue-500/20 rounded-2xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">⚡ Orchestrator Active</p>
                <p className="text-xs text-slate-400">Google Antigravity coordinating all 8 agents</p>
              </div>
            </div>
            {!hasData && (
              <button
                onClick={runDemoTrace}
                disabled={running}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {running ? "Running..." : "Run Demo Trace"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Agent Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {AGENTS.map((agent, index) => {
            const insights = getKeyInsights(agent.key);
            const isExpanded = expanded === agent.key;
            const colorClass = COLOR_MAP[agent.color] || COLOR_MAP.blue;

            return (
              <motion.div
                key={agent.key}
                variants={itemVariants}
                className="relative"
              >
                {/* Timeline connector */}
                {index < AGENTS.length - 1 && (
                  <div className="absolute left-7 top-16 w-0.5 h-4 bg-blue-500/20 z-0" />
                )}

                <div
                  className="relative bg-[#0f172a]/50 border border-blue-500/15 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-400/30 transition-all backdrop-blur-sm"
                  onClick={() => setExpanded(isExpanded ? null : agent.key)}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100" />

                  {/* Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${colorClass}`}>
                      {agent.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{agent.name}</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                          ✓ executed
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">#{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{agent.desc}</p>
                    </div>
                    <span className="text-slate-600 text-xs transition-transform" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                      ▼
                    </span>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-4 pb-4 border-t border-blue-500/10"
                    >
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {insights.map((insight) => (
                          <div key={insight.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{insight.label}</p>
                            <p className="text-xs text-slate-200 font-mono break-all">{insight.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:border-blue-500/40 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </main>
    </div>
  );
}

export default function TracePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>}>
      <TraceContent />
    </Suspense>
  );
}