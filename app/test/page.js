"use client";
import { useState } from "react";

export default function TestPage() {
    const [input, setInput] = useState("");
    const [intentResult, setIntentResult] = useState(null);
    const [discoveryResult, setDiscoveryResult] = useState(null);
    const [rankingResult, setRankingResult] = useState(null);
    const [pricingResult, setPricingResult] = useState(null);
    const [bookingResult, setBookingResult] = useState(null);
    const [notificationResult, setNotificationResult] = useState(null);
    const [followupResult, setFollowupResult] = useState(null);
    const [disputeResult, setDisputeResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testAgents = async () => {
        setLoading(true);
        try {
            // Step 1: Intent Agent
            const intentRes = await fetch("/api/agents/intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput: input }),
            });
            const intentData = await intentRes.json();
            setIntentResult(intentData);

            // Step 2: Discovery Agent
            const discoveryRes = await fetch("/api/agents/discovery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceType: intentData.service_type,
                    location: intentData.location,
                    preferredTime: intentData.preferred_time,
                    budgetSensitivity: intentData.budget_sensitivity,
                    urgency: intentData.urgency,
                }),
            });
            const discoveryData = await discoveryRes.json();
            setDiscoveryResult(discoveryData);

            // Step 3: Ranking Agent
            const rankingRes = await fetch("/api/agents/ranking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    providers: discoveryData.providers,
                    serviceType: intentData.service_type,
                    location: intentData.location,
                    budgetSensitivity: intentData.budget_sensitivity,
                    urgency: intentData.urgency,
                    preferredTime: intentData.preferred_time,
                }),
            });
            const rankingData = await rankingRes.json();
            setRankingResult(rankingData);

            // Step 4: Pricing Agent
            const topProvider = rankingData.rankedProviders[0];
            const pricingRes = await fetch("/api/agents/pricing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: topProvider,
                    serviceType: intentData.service_type,
                    urgency: intentData.urgency,
                    budgetSensitivity: intentData.budget_sensitivity,
                    preferredTime: intentData.preferred_time,
                }),
            });
            const pricingData = await pricingRes.json();
            setPricingResult(pricingData);

            // Step 5: Booking Agent
            const bookingRes = await fetch("/api/agents/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: topProvider,
                    serviceType: intentData.service_type,
                    preferredTime: intentData.preferred_time,
                    location: intentData.location,
                    pricingData: pricingData,
                    urgency: intentData.urgency,
                }),
            });
            const bookingData = await bookingRes.json();
            setBookingResult(bookingData);

            // Step 6: Notification Agent
            const notificationRes = await fetch("/api/agents/notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking: bookingData.booking,
                    provider: topProvider,
                    serviceType: intentData.service_type,
                    pricingData: pricingData,
                }),
            });
            const notificationData = await notificationRes.json();
            setNotificationResult(notificationData);

            // Step 7: Follow-up Agent
            const followupRes = await fetch("/api/agents/followup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking: bookingData.booking,
                    provider: topProvider,
                    serviceType: intentData.service_type,
                    pricingData: pricingData,
                }),
            });
            const followupData = await followupRes.json();
            setFollowupResult(followupData);

            // Step 8: Dispute Agent (stress test scenario)
            const disputeRes = await fetch("/api/agents/dispute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking: bookingData.booking,
                    provider: topProvider,
                    serviceType: intentData.service_type,
                    pricingData: pricingData,
                    disputeType: "quality_complaint",
                    disputeDescription: "AC was not properly fixed, stopped working again after 2 hours",
                }),
            });
            const disputeData = await disputeRes.json();
            setDisputeResult(disputeData);

        } catch (error) {
            console.error("Error:", error);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "monospace" }}>
            <h1>ServeIQ Agent Pipeline Test</h1>
            <textarea
                rows={4}
                style={{ width: "100%", marginBottom: "10px" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye"
            />
            <button onClick={testAgents} disabled={loading}>
                {loading ? "Processing..." : "Test Agent Pipeline"}
            </button>

            {intentResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 1: Intent Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(intentResult, null, 2)}
                    </pre>
                </div>
            )}

            {discoveryResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 2: Discovery Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(discoveryResult, null, 2)}
                    </pre>
                </div>
            )}

            {rankingResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 3: Ranking Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(rankingResult, null, 2)}
                    </pre>
                </div>
            )}

            {pricingResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 4: Pricing Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(pricingResult, null, 2)}
                    </pre>
                </div>
            )}

            {bookingResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 5: Booking Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(bookingResult, null, 2)}
                    </pre>
                </div>
            )}

            {notificationResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 6: Notification Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(notificationResult, null, 2)}
                    </pre>
                </div>
            )}

            {followupResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 7: Follow-up Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(followupResult, null, 2)}
                    </pre>
                </div>
            )}

            {disputeResult && (
                <div style={{ marginTop: "20px" }}>
                    <h2>✅ Agent 8: Dispute Agent</h2>
                    <pre style={{ background: "#1a1a1a", color: "#00ff00", padding: "10px" }}>
                        {JSON.stringify(disputeResult, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}