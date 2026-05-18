import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { booking, provider, serviceType, pricingData } = await request.json();

        // Use Groq to generate all notifications
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Notification Agent for Pakistan's informal service economy.
Generate realistic simulated notifications for bookings. Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `Generate all notifications for this booking:

Booking ID: ${booking.booking_id}
Provider: ${provider.name}
Phone: ${provider.phone}
Service: ${serviceType}
Location: ${booking.location}
Date: ${booking.date}
Time: ${booking.time}
Price: PKR ${pricingData?.price_breakdown?.final_price}

Generate in this exact JSON format:
{
  "notifications": {
    "user_sms": {
      "to": "User Phone",
      "message": "SMS in Roman Urdu confirming booking",
      "status": "sent",
      "timestamp": "current time"
    },
    "provider_sms": {
      "to": "${provider.phone}",
      "message": "SMS to provider about new booking",
      "status": "sent",
      "timestamp": "current time"
    },
    "user_whatsapp": {
      "to": "User WhatsApp",
      "message": "WhatsApp message with booking details in Urdu/Roman Urdu",
      "status": "sent",
      "timestamp": "current time"
    },
    "provider_whatsapp": {
      "to": "${provider.phone}",
      "message": "WhatsApp message to provider with job details",
      "status": "sent",
      "timestamp": "current time"
    },
    "reminder_24h": {
      "scheduled_for": "24 hours before booking",
      "message": "Reminder message to user",
      "status": "scheduled"
    },
    "reminder_1h": {
      "scheduled_for": "1 hour before booking",
      "message": "Final reminder to user",
      "status": "scheduled"
    },
    "provider_enroute": {
      "trigger": "30 minutes before booking",
      "message": "Provider is on the way notification",
      "status": "scheduled"
    }
  },
  "notification_summary": "Total notifications sent and scheduled",
  "reasoning": "Why each notification was sent and its importance",
  "delivery_status": "all_delivered"
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
        console.log("║   NOTIFICATION AGENT TRACE     ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Booking ID: ${booking.booking_id}`);
        console.log(`║ User SMS: ${parsed.notifications?.user_sms?.status}`);
        console.log(`║ Provider SMS: ${parsed.notifications?.provider_sms?.status}`);
        console.log(`║ User WhatsApp: ${parsed.notifications?.user_whatsapp?.status}`);
        console.log(`║ Provider WhatsApp: ${parsed.notifications?.provider_whatsapp?.status}`);
        console.log(`║ 24h Reminder: ${parsed.notifications?.reminder_24h?.status}`);
        console.log(`║ 1h Reminder: ${parsed.notifications?.reminder_1h?.status}`);
        console.log(`║ En-route Alert: ${parsed.notifications?.provider_enroute?.status}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Notification Agent",
            status: "success",
            booking_id: booking.booking_id,
            ...parsed,
        });

    } catch (error) {
        console.error("Notification Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Notification Agent failed",
                agent: "Notification Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}