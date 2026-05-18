import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, payload, state } = body;

        // Construct baseUrl for calling other internal API routes
        // This allows the Orchestrator to call the local Next.js API routes directly
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host") || "localhost:3000";
        const baseUrl = `${protocol}://${host}`;

        // Agent trace log for Orchestrator
        console.log("╔════════════════════════════════╗");
        console.log("║      ORCHESTRATOR TRACE        ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Action: ${action || "process_intent"}`);
        console.log("╚════════════════════════════════╝");

        if (action === "process_intent") {
            // Step 1: Call Intent Agent
            const intentRes = await fetch(`${baseUrl}/api/agents/intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userInput: payload.userInput })
            });
            const intentData = await intentRes.json();

            if (intentData.confirmation_needed) {
                return NextResponse.json({
                    nextStep: "ask_clarification",
                    message: intentData.confirmation_question,
                    state: { intent: intentData }
                });
            }

            // Step 2: Call Discovery Agent
            const discoveryRes = await fetch(`${baseUrl}/api/agents/discovery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceType: intentData.service_type,
                    location: intentData.location,
                    preferredTime: intentData.preferred_time,
                    budgetSensitivity: intentData.budget_sensitivity,
                    urgency: intentData.urgency
                })
            });
            const discoveryData = await discoveryRes.json();

            if (!discoveryData.providers || discoveryData.providers.length === 0) {
                return NextResponse.json({
                    nextStep: "no_providers",
                    message: discoveryData.message,
                    state: { intent: intentData, discovery: discoveryData }
                });
            }

            // Step 3: Call Ranking Agent
            const rankingRes = await fetch(`${baseUrl}/api/agents/ranking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    providers: discoveryData.providers,
                    serviceType: intentData.service_type,
                    location: intentData.location,
                    budgetSensitivity: intentData.budget_sensitivity,
                    urgency: intentData.urgency,
                    preferredTime: intentData.preferred_time
                })
            });
            const rankingData = await rankingRes.json();

            return NextResponse.json({
                nextStep: "select_provider",
                message: `Found ${rankingData.rankedProviders?.length || 0} providers. Top pick is ${rankingData.rankedProviders?.[0]?.name || "None"}.`,
                state: {
                    intent: intentData,
                    discovery: discoveryData,
                    ranking: rankingData
                }
            });
        }

        if (action === "get_pricing") {
            // payload contains provider, and we have state
            const pricingRes = await fetch(`${baseUrl}/api/agents/pricing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: payload.provider,
                    serviceType: state.intent.service_type,
                    urgency: state.intent.urgency,
                    budgetSensitivity: state.intent.budget_sensitivity,
                    preferredTime: state.intent.preferred_time
                })
            });
            const pricingData = await pricingRes.json();

            return NextResponse.json({
                nextStep: "confirm_booking",
                pricing: pricingData,
                state: { ...state, pricing: pricingData, selectedProvider: payload.provider }
            });
        }

        if (action === "confirm_booking") {
            // Call Booking Agent
            const bookingRes = await fetch(`${baseUrl}/api/agents/booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: state.selectedProvider,
                    serviceType: state.intent.service_type,
                    preferredTime: state.intent.preferred_time,
                    location: state.intent.location,
                    pricingData: state.pricing,
                    urgency: state.intent.urgency
                })
            });
            const bookingData = await bookingRes.json();

            // If booked, call Notification Agent
            let notificationData = null;
            if (bookingData.status === "success") {
                const notifRes = await fetch(`${baseUrl}/api/agents/notification`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        booking: bookingData.booking,
                        provider: state.selectedProvider,
                        serviceType: state.intent.service_type,
                        pricingData: state.pricing
                    })
                });
                notificationData = await notifRes.json();
            }

            return NextResponse.json({
                nextStep: "completed",
                booking: bookingData,
                notification: notificationData,
                state: { ...state, booking: bookingData, notification: notificationData }
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Orchestrator Error:", error);
        return NextResponse.json({
            error: "Orchestrator processing failed",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
