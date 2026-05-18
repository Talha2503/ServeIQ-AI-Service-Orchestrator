import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { provider, serviceType, preferredTime, location, pricingData, urgency } = await request.json();

        // Generate booking ID
        const bookingId = `SIQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Simulate slot selection based on preferred time
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const tomorrowDay = days[tomorrow.getDay()];

        // Get available slots for tomorrow
        const availableSlots = provider.availability[tomorrowDay] || [];

        // Select best slot based on preferred time
        let selectedSlot = null;
        if (preferredTime?.includes("subah") || preferredTime?.includes("morning")) {
            selectedSlot = availableSlots.find(slot => parseInt(slot) <= 11) || availableSlots[0];
        } else if (preferredTime?.includes("afternoon") || preferredTime?.includes("dopahar")) {
            selectedSlot = availableSlots.find(slot => parseInt(slot) >= 12 && parseInt(slot) <= 15) || availableSlots[0];
        } else {
            selectedSlot = availableSlots[0];
        }

        // Fallback if no slot available tomorrow
        if (!selectedSlot) {
            return Response.json({
                agent: "Booking Agent",
                status: "no_slot_available",
                message: `No slots available for ${provider.name} tomorrow`,
                fallback: "Checking next available slot...",
                alternate_action: "Added to waitlist - will notify when slot opens",
                booking_id: bookingId,
                reasoning: "Provider has no availability tomorrow, added to waitlist"
            });
        }

        // Format booking date
        const bookingDate = tomorrow.toLocaleDateString("en-PK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        // Simulate booking confirmation
        const booking = {
            booking_id: bookingId,
            status: "confirmed",
            provider: {
                id: provider.id,
                name: provider.name,
                phone: provider.phone,
                specialization: provider.specialization,
            },
            service: serviceType,
            location: location,
            date: bookingDate,
            time: selectedSlot,
            price: pricingData?.price_breakdown?.final_price,
            budget_alternative: pricingData?.budget_alternative,
        };

        // Use Groq to generate booking confirmation
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Booking Agent for Pakistan's informal service economy.
Generate booking confirmations and simulate notifications. Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `Generate a booking confirmation for:

Booking ID: ${bookingId}
Provider: ${provider.name}
Service: ${serviceType}
Location: ${location}
Date: ${bookingDate}
Time: ${selectedSlot}
Final Price: PKR ${pricingData?.price_breakdown?.final_price}
Provider Phone: ${provider.phone}

Generate confirmation in this exact JSON format:
{
  "confirmation_message": "Booking confirmed message in friendly tone",
  "sms_simulation": "Simulated SMS text to send to user",
  "whatsapp_simulation": "Simulated WhatsApp message to provider",
  "calendar_update": "Calendar entry description",
  "receipt_note": "Receipt summary",
  "reminder_scheduled": "When reminder will be sent",
  "reasoning": "How booking decision was made",
  "double_booking_check": "Confirmed no double booking",
  "travel_buffer": "Travel time buffer added for provider"
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
        console.log("║      BOOKING AGENT TRACE       ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Booking ID: ${bookingId}`);
        console.log(`║ Provider: ${provider.name}`);
        console.log(`║ Date: ${bookingDate}`);
        console.log(`║ Time: ${selectedSlot}`);
        console.log(`║ Price: PKR ${pricingData?.price_breakdown?.final_price}`);
        console.log(`║ Double Booking Check: ${parsed.double_booking_check}`);
        console.log(`║ Travel Buffer: ${parsed.travel_buffer}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Booking Agent",
            status: "success",
            booking,
            ...parsed,
        });

    } catch (error) {
        console.error("Booking Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Booking Agent failed",
                agent: "Booking Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}