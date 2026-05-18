import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { booking, provider, serviceType, pricingData } = await request.json();

        // Simulate service completion
        const completionChecklist = {
            provider_arrived_on_time: true,
            service_started: true,
            service_completed: true,
            photo_evidence: "placeholder_photo_001.jpg",
            video_evidence: "placeholder_video_001.mp4",
            customer_signature: true,
            payment_collected: true,
        };

        // Simulate customer feedback
        const customerFeedback = {
            rating: 4.8,
            comment: "Ustad Ahmed was very professional and fixed the AC quickly!",
            on_time: true,
            would_recommend: true,
        };

        // Use Groq to generate follow-up actions
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Follow-up Agent for Pakistan's informal service economy.
Handle post-service follow-up, feedback collection, and reputation updates. Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `Handle follow-up for completed service:

Booking ID: ${booking.booking_id}
Provider: ${provider.name}
Service: ${serviceType}
Location: ${booking.location}
Date: ${booking.date}
Time: ${booking.time}
Price Paid: PKR ${pricingData?.price_breakdown?.final_price}

Service Completion Checklist:
${JSON.stringify(completionChecklist)}

Customer Feedback:
${JSON.stringify(customerFeedback)}

Previous Provider Rating: ${provider.rating}
Previous Total Reviews: ${provider.total_reviews}

Generate follow-up in this exact JSON format:
{
  "service_status": "completed",
  "completion_checklist": ${JSON.stringify(completionChecklist)},
  "customer_feedback": ${JSON.stringify(customerFeedback)},
  "reputation_update": {
    "old_rating": ${provider.rating},
    "new_rating": 0.0,
    "rating_change": 0.0,
    "total_reviews": ${provider.total_reviews + 1},
    "reasoning": "How rating was calculated"
  },
  "followup_sms": "Thank you SMS to customer in Roman Urdu",
  "provider_performance_note": "Note about provider performance",
  "future_matching_impact": "How this feedback affects future matching",
  "reasoning": "Full follow-up process explanation"
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
        console.log("║     FOLLOW-UP AGENT TRACE      ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Booking ID: ${booking.booking_id}`);
        console.log(`║ Service Status: ${parsed.service_status}`);
        console.log(`║ Customer Rating: ${parsed.customer_feedback?.rating}`);
        console.log(`║ Old Rating: ${parsed.reputation_update?.old_rating}`);
        console.log(`║ New Rating: ${parsed.reputation_update?.new_rating}`);
        console.log(`║ Future Impact: ${parsed.future_matching_impact}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Follow-up Agent",
            status: "success",
            booking_id: booking.booking_id,
            ...parsed,
        });

    } catch (error) {
        console.error("Follow-up Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Follow-up Agent failed",
                agent: "Follow-up Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}