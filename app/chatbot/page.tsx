"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "bot" | "system";
  type: "text" | "providers" | "pricing" | "receipt";
  content?: string;
  data?: any;
};

export default function Chatbot() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "bot",
      type: "text",
      content: "Assalam o Alaikum! 👋 I am ServeIQ, your AI Service Orchestrator. What service do you need today? (e.g. AC Repair, Electrician, Plumber)",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [workflowState, setWorkflowState] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() + Math.random().toString() }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput("");
    addMessage({ role: "user", type: "text", content: userInput });
    setLoading(true);

    try {
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_intent",
          payload: { userInput },
          state: workflowState
        }),
      });

      const data = await res.json();

      if (data.error) {
        addMessage({ role: "bot", type: "text", content: "Sorry, I encountered an error. Please try again." });
        setLoading(false);
        return;
      }

      setWorkflowState(data.state);

      if (data.nextStep === "ask_clarification") {
        addMessage({ role: "bot", type: "text", content: data.message });
      } else if (data.nextStep === "no_providers") {
        addMessage({ role: "bot", type: "text", content: `⚠️ ${data.message}\n\nTrying alternate providers...` });
      } else if (data.nextStep === "select_provider") {
        addMessage({ role: "bot", type: "text", content: data.message });
        addMessage({ role: "bot", type: "providers", data: data.state.ranking.rankedProviders });
      }

    } catch (error) {
      console.error(error);
      addMessage({ role: "bot", type: "text", content: "Network error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = async (provider: any) => {
    addMessage({ role: "user", type: "text", content: `I want to book ${provider.name}` });
    setLoading(true);

    try {
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_pricing",
          payload: { provider },
          state: workflowState
        }),
      });

      const data = await res.json();
      setWorkflowState(data.state);
      addMessage({ role: "bot", type: "pricing", data: data.pricing });

    } catch (error) {
      console.error(error);
      addMessage({ role: "bot", type: "text", content: "Error getting pricing. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    addMessage({ role: "user", type: "text", content: "Yes, please confirm my booking." });
    setLoading(true);

    try {
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_booking",
          payload: {},
          state: workflowState
        }),
      });

      const data = await res.json();
      setWorkflowState(data.state);

      if (data.booking?.status === "success") {
        addMessage({ role: "bot", type: "receipt", data: data });
      } else {
        addMessage({ role: "bot", type: "text", content: data.booking?.message || "Could not complete booking. Please try again." });
      }

    } catch (error) {
      console.error(error);
      addMessage({ role: "bot", type: "text", content: "Error confirming booking." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#0a0a0a] relative shadow-2xl text-white">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white p-4 flex items-center justify-between shadow-md z-10 border-b border-[#2d2d3b]">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white mr-3 text-sm"
          >
            ←
          </button>
          <div className="w-10 h-10 bg-[#25d366] rounded-full flex items-center justify-center mr-3 font-bold text-black text-xl">
            IQ
          </div>
          <div>
            <h1 className="font-semibold text-lg">ServeIQ Assistant</h1>
            <p className="text-xs text-[#9ca3af]">
              {workflowState ? "🟡 Processing..." : "🟢 Ready"}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/trace")}
          className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
        >
          View Traces
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 bg-[#0a0a0a]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === "user"
              ? "bg-[#005c4b] rounded-tr-none text-white"
              : "bg-[#1a1a1a] rounded-tl-none text-white border border-[#ffffff10]"
              }`}>

              {/* Text Message */}
              {msg.type === "text" && (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Providers List */}
              {msg.type === "providers" && (
                <div className="space-y-3 mt-1">
                  <p className="text-sm font-bold text-white border-b border-[#333] pb-2">
                    🏆 Ranked Providers:
                  </p>
                  {msg.data?.map((provider: any, idx: number) => (
                    <div key={idx} className="bg-[#2d2d2d] border border-[#444] rounded-xl p-3 text-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-white">{provider.name}</span>
                          <span className="ml-2 text-lg">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                          </span>
                        </div>
                        <span className="text-[#25d366] font-bold">⭐ {provider.rating}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="bg-[#1a1a1a] rounded-lg p-1.5 text-center">
                          <div className="text-green-400 font-bold">{provider.on_time_score}%</div>
                          <div className="text-gray-500">On-time</div>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-1.5 text-center">
                          <div className="text-red-400 font-bold">{provider.cancellation_rate}%</div>
                          <div className="text-gray-500">Cancel</div>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-1.5 text-center">
                          <div className="text-blue-400 font-bold">{provider.experience_years}yr</div>
                          <div className="text-gray-500">Exp.</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">PKR {provider.hourly_rate}/hr</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/provider/${provider.id}?data=${encodeURIComponent(JSON.stringify(provider))}`)}
                            className="border border-[#25d366] text-[#25d366] px-2 py-1 rounded-lg text-xs font-bold hover:bg-[#25d366]/10 transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleSelectProvider(provider)}
                            disabled={loading}
                            className="bg-[#25d366] text-black px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#20bd5a] transition-colors disabled:opacity-50"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                      {provider.scores && (
                        <div className="text-xs text-gray-500 text-right">
                          AI Score: <span className="text-blue-400 font-bold">{provider.scores.total_score}/100</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const rankingData = workflowState?.ranking;
                      if (rankingData) {
                        router.push(`/providers?data=${encodeURIComponent(JSON.stringify({
                          rankedProviders: rankingData.rankedProviders,
                          serviceType: workflowState?.intent?.service_type,
                          location: workflowState?.intent?.location,
                          ranking_explanation: rankingData.ranking_explanation
                        }))}`);
                      }
                    }}
                    className="w-full text-xs text-gray-400 border border-[#333] rounded-xl py-2 hover:border-[#25d366] hover:text-[#25d366] transition-colors"
                  >
                    View All Providers →
                  </button>
                </div>
              )}

              {/* Pricing Breakdown */}
              {msg.type === "pricing" && msg.data && (
                <div className="text-sm space-y-2">
                  <p className="font-bold border-b border-[#333] pb-2 text-white">💰 Price Estimate</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span>Base Cost:</span>
                      <span>PKR {msg.data.price_breakdown?.base_service_cost}</span>
                    </div>
                    {msg.data.price_breakdown?.urgency_adjustment > 0 && (
                      <div className="flex justify-between text-orange-400">
                        <span>Urgency:</span>
                        <span>+PKR {msg.data.price_breakdown?.urgency_adjustment}</span>
                      </div>
                    )}
                    {msg.data.price_breakdown?.surge_adjustment > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Surge:</span>
                        <span>+PKR {msg.data.price_breakdown?.surge_adjustment}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>Visit Fee:</span>
                      <span>PKR {msg.data.price_breakdown?.visit_fee}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Distance:</span>
                      <span>PKR {msg.data.price_breakdown?.distance_cost}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span>PKR {msg.data.price_breakdown?.loyalty_discount}</span>
                    </div>
                    <div className="flex justify-between text-[#25d366] font-bold border-t border-[#333] pt-2 mt-1 text-base">
                      <span>Final Price:</span>
                      <span>PKR {msg.data.price_breakdown?.final_price}</span>
                    </div>
                    {msg.data.budget_alternative && (
                      <div className="flex justify-between text-blue-400 text-xs">
                        <span>Budget Alt:</span>
                        <span>PKR {msg.data.budget_alternative}</span>
                      </div>
                    )}
                  </div>
                  {msg.data.fairness_note && (
                    <p className="text-xs text-gray-500 italic mt-2 border-l-2 border-[#25d366] pl-2">
                      {msg.data.fairness_note}
                    </p>
                  )}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    className="w-full mt-3 bg-[#25d366] text-black py-3 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors disabled:opacity-50"
                  >
                    ✅ Confirm & Book
                  </button>
                </div>
              )}

              {/* Booking Receipt */}
              {msg.type === "receipt" && msg.data && (
                <div className="text-sm space-y-3">
                  <div className="bg-[#25d366]/20 text-[#25d366] p-3 rounded-xl text-center font-bold text-base">
                    🎉 Booking Confirmed!
                  </div>
                  <div className="border border-[#444] rounded-xl p-3 bg-[#2d2d2d] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Booking ID</span>
                      <span className="text-white font-mono">{msg.data.booking?.booking?.booking_id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Provider</span>
                      <span className="text-white">{msg.data.booking?.booking?.provider?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Service</span>
                      <span className="text-white">{msg.data.booking?.booking?.service}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Date</span>
                      <span className="text-white">{msg.data.booking?.booking?.date}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Time</span>
                      <span className="text-white">{msg.data.booking?.booking?.time}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-t border-[#444] pt-2">
                      <span className="text-gray-400">Total</span>
                      <span className="text-[#25d366]">PKR {msg.data.booking?.booking?.price}</span>
                    </div>
                  </div>

                  {/* SMS Notification */}
                  {msg.data.notification?.notifications?.user_sms && (
                    <div className="text-xs text-gray-400 bg-[#1a1a1a] p-2 border-l-4 border-[#25d366] rounded-r-xl">
                      <p className="font-bold text-white mb-1">📱 SMS Sent:</p>
                      <p className="italic">"{msg.data.notification.notifications.user_sms.message}"</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        const bookingData = msg.data.booking?.booking;
                        const providerData = workflowState?.selectedProvider;
                        const pricingData = workflowState?.pricing;
                        router.push(
                          `/booking?booking=${encodeURIComponent(JSON.stringify(bookingData))}&provider=${encodeURIComponent(JSON.stringify(providerData))}&pricing=${encodeURIComponent(JSON.stringify(pricingData))}`
                        );
                      }}
                      className="bg-transparent border border-[#25d366] text-[#25d366] py-2 rounded-xl font-bold text-xs hover:bg-[#25d366]/10 transition-colors"
                    >
                      📋 Full Receipt
                    </button>
                    <button
                      onClick={() => {
                        const bookingResult = msg.data.booking?.booking;
                        const providerResult = workflowState?.selectedProvider;
                        const pricingResult = workflowState?.pricing;
                        sessionStorage.setItem("serveiq_booking", JSON.stringify(bookingResult));
                        sessionStorage.setItem("serveiq_provider", JSON.stringify(providerResult));
                        sessionStorage.setItem("serveiq_pricing", JSON.stringify(pricingResult));
                        router.push("/booking");
                      }}
                      className="bg-blue-600 text-white py-2 rounded-xl font-bold text-xs hover:bg-blue-500 transition-colors"
                    >
                      📋 Track Service
                    </button>
                  </div>
                  <button
                    onClick={() => router.push("/trace")}
                    className="w-full bg-transparent border border-blue-500/30 text-blue-400 py-2 rounded-xl font-bold text-xs hover:bg-blue-500/10 transition-colors"
                  >
                    🤖 View Agent Traces
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[10px] text-gray-600 text-right mt-1">
                {mounted ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none p-3 border border-[#ffffff10] flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#1a1a1a] border-t border-[#2d2d3b] p-3 absolute bottom-0 w-full flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
          placeholder="Type in Urdu, Roman Urdu or English..."
          className="flex-1 rounded-full px-4 py-2.5 bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#25d366] text-sm text-white placeholder-gray-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-[#25d366] text-black p-2.5 rounded-full hover:bg-[#20bd5a] disabled:opacity-50 transition-colors flex items-center justify-center w-10 h-10"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}