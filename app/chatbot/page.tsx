"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "bot" | "system";
  type: "text" | "providers" | "pricing" | "receipt";
  content?: string;
  data?: any;
};

export default function Chatbot() {
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
        addMessage({ role: "bot", type: "text", content: data.message });
      } else if (data.nextStep === "select_provider") {
        addMessage({ role: "bot", type: "text", content: data.message });
        addMessage({ role: "bot", type: "providers", data: data.state.ranking.rankedProviders });
      }

    } catch (error) {
      console.error(error);
      addMessage({ role: "bot", type: "text", content: "Network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = async (provider: any) => {
    addMessage({ role: "user", type: "text", content: `I selected ${provider.name}` });
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
      addMessage({ role: "bot", type: "text", content: "Error getting pricing." });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    addMessage({ role: "user", type: "text", content: "Please confirm my booking." });
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
        addMessage({ role: "bot", type: "text", content: data.booking?.message || "Failed to book slot." });
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
      <div className="bg-[#1a1a2e] text-white p-4 flex items-center shadow-md z-10 border-b border-[#2d2d3b]">
        <div className="w-10 h-10 bg-[#25d366] rounded-full flex items-center justify-center mr-3 font-bold text-white text-xl">
          IQ
        </div>
        <div>
          <h1 className="font-semibold text-lg">ServeIQ Assistant</h1>
          <p className="text-xs text-[#9ca3af]">Active - {workflowState ? "Processing" : "Ready"}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 relative bg-[#0a0a0a]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 shadow-sm ${msg.role === "user"
                ? "bg-[#005c4b] rounded-tr-none text-white"
                : "bg-[#1a1a1a] rounded-tl-none text-white"
                }`}
            >
              {msg.type === "text" && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

              {/* Providers List */}
              {msg.type === "providers" && (
                <div className="space-y-3 mt-1">
                  <p className="text-sm font-semibold text-white border-b border-[#333] pb-2">Available Providers:</p>
                  {msg.data?.map((provider: any, idx: number) => (
                    <div key={idx} className="bg-[#2d2d2d] border border-[#444] rounded p-3 text-sm flex flex-col gap-1 shadow-sm">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">{provider.name}</span>
                        <span className="text-[#25d366]">★ {provider.rating}</span>
                      </div>
                      <p className="text-xs text-[#9ca3af]">{provider.experience_years} yrs exp | {provider.cancellation_rate}% cancellation</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold text-white">PKR {provider.hourly_rate}/hr</span>
                        <button
                          onClick={() => handleSelectProvider(provider)}
                          disabled={loading}
                          className="bg-[#25d366] text-black px-3 py-1.5 rounded hover:bg-[#20bd5a] transition-colors text-xs font-bold"
                        >
                          Get Pricing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing Breakdown */}
              {msg.type === "pricing" && msg.data && (
                <div className="text-sm space-y-2">
                  <p className="font-bold border-b border-[#333] pb-1 text-white">Price Estimate</p>
                  <div className="flex justify-between text-[#9ca3af]"><span>Base Cost:</span> <span>PKR {msg.data.price_breakdown.base_service_cost}</span></div>
                  {msg.data.price_breakdown.surge_adjustment > 0 && <div className="flex justify-between text-orange-400"><span>Surge:</span> <span>+PKR {msg.data.price_breakdown.surge_adjustment}</span></div>}
                  {msg.data.price_breakdown.urgency_adjustment > 0 && <div className="flex justify-between text-red-400"><span>Urgency:</span> <span>+PKR {msg.data.price_breakdown.urgency_adjustment}</span></div>}
                  <div className="flex justify-between text-[#9ca3af]"><span>Visit Fee:</span> <span>PKR {msg.data.price_breakdown.visit_fee}</span></div>
                  <div className="flex justify-between text-[#25d366] font-bold border-t border-[#333] pt-1 mt-1"><span>Final Price:</span> <span>PKR {msg.data.price_breakdown.final_price}</span></div>

                  <p className="text-xs text-[#9ca3af] italic mt-2">{msg.data.fairness_note}</p>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    className="w-full mt-3 bg-[#25d366] text-black py-2 rounded shadow-md hover:bg-[#20bd5a] transition-colors font-bold"
                  >
                    Confirm & Book
                  </button>
                </div>
              )}

              {/* Booking Receipt */}
              {msg.type === "receipt" && msg.data && (
                <div className="text-sm space-y-3">
                  <div className="bg-[#25d366]/20 text-[#25d366] p-2 rounded text-center font-bold">
                    Booking Confirmed! ✅
                  </div>
                  <div className="border border-[#444] rounded p-3 bg-[#2d2d2d] space-y-1 text-white">
                    <p><strong className="text-[#9ca3af]">ID:</strong> {msg.data.booking.booking.booking_id}</p>
                    <p><strong className="text-[#9ca3af]">Provider:</strong> {msg.data.booking.booking.provider.name}</p>
                    <p><strong className="text-[#9ca3af]">Service:</strong> {msg.data.booking.booking.service}</p>
                    <p><strong className="text-[#9ca3af]">Date:</strong> {msg.data.booking.booking.date}</p>
                    <p><strong className="text-[#9ca3af]">Time:</strong> {msg.data.booking.booking.time}</p>
                    <p><strong className="text-[#9ca3af]">Total:</strong> PKR {msg.data.booking.booking.price}</p>
                  </div>
                  <div className="text-xs text-[#9ca3af] bg-[#1a1a1a] p-2 border-l-4 border-[#25d366]">
                    <p className="font-semibold text-white mb-1">Simulated SMS sent:</p>
                    <p className="italic">"{msg.data.notification?.notifications?.user_sms?.message}"</p>
                  </div>
                </div>
              )}

              {/* Timestamp placeholder */}
              <div className="text-[10px] text-[#9ca3af] text-right mt-1">
                {mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] rounded-lg rounded-tl-none p-3 shadow-sm text-white flex space-x-2 items-center">
              <div className="w-2 h-2 bg-[#9ca3af] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-full px-4 py-2.5 bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#25d366] shadow-sm text-sm text-white placeholder-[#9ca3af]"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-[#25d366] text-black p-2.5 rounded-full hover:bg-[#20bd5a] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center w-10 h-10"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
