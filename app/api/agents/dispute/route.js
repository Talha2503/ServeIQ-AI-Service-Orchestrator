import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { booking, provider, serviceType, pricingData, disputeType, disputeDescription } = await request.json();

        // Use Groq to handle dispute
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Dispute Agent for Pakistan's informal service economy.
Handle disputes fairly for both users and providers. Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `Handle this dispute:

Booking ID: ${booking.booking_id}
Provider: ${provider.name}
Service: ${serviceType}
Location: ${booking.location}
Date: ${booking.date}
Price Paid: PKR ${pricingData?.price_breakdown?.final_price}
Provider Rating: ${provider.rating}
Cancellation Rate: ${provider.cancellation_rate}%

Dispute Type: ${disputeType}
Dispute Description: ${disputeDescription}

Resolve this dispute and respond in this exact JSON format:
{
  "dispute_id": "DIS-${Date.now()}",
  "dispute_type": "${disputeType}",
  "severity": "low/medium/high",
  "investigation": {
    "user_claim": "Summary of user complaint",
    "provider_history": "Provider's track record analysis",
    "evidence_checked": ["list of evidence reviewed"],
    "confidence_in_resolution": 0
  },
  "resolution": {
    "decision": "What was decided",
    "action_taken": "What action was taken",
    "refund_amount": 0,
    "compensation": "Any compensation offered",
    "provider_penalty": "Any penalty for provider"
  },
  "escalation": {
    "escalated_to_human": false,
    "reason": "Why or why not escalated"
  },
  "blacklist_check": {
    "provider_blacklisted": false,
    "reason": "Why or why not blacklisted"
  },
  "notification": {
    "user_message": "Resolution message to user in Roman Urdu",
    "provider_message": "Resolution message to provider"
  },
  "future_prevention": "How to prevent this dispute in future",
  "reasoning": "Full dispute resolution reasoning"
}`
                }
            ],
            temperature: 0.3,
        });

        const response = completion.choices[0].message.content;
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

        // Agent trace
        console.log("╔════════════════════════════════╗");
        console.log("║      DISPUTE AGENT TRACE       ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Dispute ID: ${parsed.dispute_id}`);
        console.log(`║ Type: ${disputeType}`);
        console.log(`║ Severity: ${parsed.severity}`);
        console.log(`║ Decision: ${parsed.resolution?.decision}`);
        console.log(`║ Refund: PKR ${parsed.resolution?.refund_amount}`);
        console.log(`║ Escalated: ${parsed.escalation?.escalated_to_human}`);
        console.log(`║ Blacklisted: ${parsed.blacklist_check?.provider_blacklisted}`);
        console.log(`║ Reasoning: ${parsed.reasoning}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Dispute Agent",
            status: "success",
            booking_id: booking.booking_id,
            ...parsed,
        });

    } catch (error) {
        console.error("Dispute Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Dispute Agent failed",
                agent: "Dispute Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}