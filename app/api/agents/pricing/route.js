import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { provider, serviceType, urgency, budgetSensitivity, preferredTime } = await request.json();

        // Dynamic Pricing Calculation
        const baseRate = provider.hourly_rate;
        const visitFee = provider.visit_fee;

        // Urgency Multiplier
        const urgencyMultiplier = urgency === "high" ? 1.2 : urgency === "medium" ? 1.1 : 1.0;

        // Demand Surge (simulated based on time)
        const hour = new Date().getHours();
        const surgeFactor = hour >= 8 && hour <= 10 ? 1.15 : 1.0;

        // Loyalty Discount (simulated)
        const loyaltyDiscount = 0.05;

        // Complexity Factor
        const complexityFactor =
            provider.complexity_level?.includes("complex") ? 1.3 :
                provider.complexity_level?.includes("intermediate") ? 1.15 : 1.0;

        // Distance Cost (simulated PKR per km)
        const distanceCost = 150;

        // Calculate final price
        const baseServiceCost = baseRate * complexityFactor;
        const urgencyCost = baseServiceCost * (urgencyMultiplier - 1);
        const surgeCost = baseServiceCost * (surgeFactor - 1);
        const discountAmount = baseServiceCost * loyaltyDiscount;
        const totalBeforeDiscount = baseServiceCost + urgencyCost + surgeCost + visitFee + distanceCost;
        const finalPrice = Math.round(totalBeforeDiscount - discountAmount);

        // Budget Alternative
        const budgetAlternative = budgetSensitivity === "high" ? Math.round(finalPrice * 0.85) : null;

        // Use Groq to explain pricing
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Pricing Agent for Pakistan's informal service economy.
Explain pricing decisions transparently. Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `Generate a transparent price explanation for:

Provider: ${provider.name}
Service: ${serviceType}
Base Rate: PKR ${baseRate}/hour
Visit Fee: PKR ${visitFee}
Urgency: ${urgency} (multiplier: ${urgencyMultiplier}x)
Surge Factor: ${surgeFactor}x
Complexity: ${provider.complexity_level}
Distance Cost: PKR ${distanceCost}
Loyalty Discount: ${loyaltyDiscount * 100}%
Final Price: PKR ${finalPrice}
Budget Sensitivity: ${budgetSensitivity}
Budget Alternative: PKR ${budgetAlternative}

Respond in this exact JSON format:
{
  "price_breakdown": {
    "base_service_cost": ${Math.round(baseServiceCost)},
    "urgency_adjustment": ${Math.round(urgencyCost)},
    "surge_adjustment": ${Math.round(surgeCost)},
    "visit_fee": ${visitFee},
    "distance_cost": ${distanceCost},
    "loyalty_discount": -${Math.round(discountAmount)},
    "final_price": ${finalPrice}
  },
  "budget_alternative": ${budgetAlternative},
  "fairness_note": "explanation of why this price is fair for both user and provider",
  "reasoning": "step by step pricing logic",
  "recommendation": "budget advice for user"
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
        console.log("║      PRICING AGENT TRACE       ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Provider: ${provider.name}`);
        console.log(`║ Base Rate: PKR ${baseRate}`);
        console.log(`║ Urgency Multiplier: ${urgencyMultiplier}x`);
        console.log(`║ Surge Factor: ${surgeFactor}x`);
        console.log(`║ Complexity Factor: ${complexityFactor}x`);
        console.log(`║ Final Price: PKR ${finalPrice}`);
        console.log(`║ Budget Alternative: PKR ${budgetAlternative}`);
        console.log(`║ Reasoning: ${parsed.reasoning}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Pricing Agent",
            status: "success",
            provider_name: provider.name,
            ...parsed,
        });

    } catch (error) {
        console.error("Pricing Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Pricing Agent failed",
                agent: "Pricing Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}