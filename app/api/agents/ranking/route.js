import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { providers, serviceType, location, budgetSensitivity, urgency, preferredTime } = await request.json();

        if (!providers || providers.length === 0) {
            return Response.json({
                agent: "Ranking Agent",
                status: "no_providers",
                message: "No providers to rank",
                rankedProviders: []
            });
        }

        // Calculate scores for each provider using 6+ factors
        const scoredProviders = providers.map((provider) => {
            // Factor 1: Rating Score (0-25 points)
            const ratingScore = (provider.rating / 5) * 25;

            // Factor 2: Reliability/On-time Score (0-20 points)
            const reliabilityScore = (provider.on_time_score / 100) * 20;

            // Factor 3: Cancellation Rate Score (0-15 points) - lower is better
            const cancellationScore = ((100 - provider.cancellation_rate) / 100) * 15;

            // Factor 4: Experience Score (0-15 points)
            const maxExperience = 20;
            const experienceScore = Math.min(provider.experience_years / maxExperience, 1) * 15;

            // Factor 5: Budget Score (0-15 points)
            let budgetScore = 0;
            if (budgetSensitivity === "high") {
                // Lower price is better for budget sensitive users
                budgetScore = provider.hourly_rate <= 1200 ? 15 : provider.hourly_rate <= 1500 ? 10 : 5;
            } else if (budgetSensitivity === "medium") {
                budgetScore = provider.hourly_rate <= 1500 ? 15 : 10;
            } else {
                budgetScore = 15; // Not budget sensitive
            }

            // Factor 6: Risk Score (0-10 points) - lower risk is better
            const riskScore = ((100 - provider.risk_score) / 100) * 10;

            // Factor 7: Review Sentiment (0-10 points)
            const sentimentScore =
                provider.review_sentiment === "positive" ? 10 :
                    provider.review_sentiment === "mixed" ? 5 : 0;

            // Factor 8: Capacity Score (0-10 points)
            const capacityScore =
                provider.current_bookings < provider.capacity_per_day ? 10 : 0;

            // Total Score (0-100)
            const totalScore = (
                ratingScore +
                reliabilityScore +
                cancellationScore +
                experienceScore +
                budgetScore +
                riskScore +
                sentimentScore +
                capacityScore
            ).toFixed(1);

            return {
                ...provider,
                scores: {
                    rating_score: ratingScore.toFixed(1),
                    reliability_score: reliabilityScore.toFixed(1),
                    cancellation_score: cancellationScore.toFixed(1),
                    experience_score: experienceScore.toFixed(1),
                    budget_score: budgetScore.toFixed(1),
                    risk_score: riskScore.toFixed(1),
                    sentiment_score: sentimentScore.toFixed(1),
                    capacity_score: capacityScore.toFixed(1),
                    total_score: totalScore,
                },
            };
        });

        // Sort by total score descending
        scoredProviders.sort((a, b) => b.scores.total_score - a.scores.total_score);

        // Add rank
        scoredProviders.forEach((provider, index) => {
            provider.rank = index + 1;
        });

        // Use Groq to explain ranking decision
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Ranking Agent for Pakistan's informal service economy.
Explain provider ranking decisions clearly. Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `You ranked these providers for ${serviceType} in ${location}:

Ranked Results:
${scoredProviders.map(p => `
Provider: ${p.name}
Rank: ${p.rank}
Total Score: ${p.scores.total_score}/100
Rating: ${p.rating}/5
On-time Score: ${p.on_time_score}%
Cancellation Rate: ${p.cancellation_rate}%
Experience: ${p.experience_years} years
Hourly Rate: PKR ${p.hourly_rate}
Risk Score: ${p.risk_score}
`).join("\n")}

User urgency: ${urgency}
User budget sensitivity: ${budgetSensitivity}

Explain the ranking decision in this exact JSON:
{
  "ranking_explanation": "Why provider 1 was ranked first over others",
  "top_provider_reason": "Key reason for top recommendation",
  "budget_note": "Note about pricing given budget sensitivity",
  "urgency_note": "Note about urgency handling",
  "factors_used": ["list of 6+ factors used in ranking"]
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
        console.log("║      RANKING AGENT TRACE       ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Service: ${serviceType}`);
        console.log(`║ Providers Ranked: ${scoredProviders.length}`);
        console.log(`║ Top Provider: ${scoredProviders[0]?.name}`);
        console.log(`║ Top Score: ${scoredProviders[0]?.scores.total_score}/100`);
        console.log(`║ Factors Used: ${parsed.factors_used?.join(", ")}`);
        console.log(`║ Reasoning: ${parsed.ranking_explanation}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Ranking Agent",
            status: "success",
            rankedProviders: scoredProviders,
            ...parsed,
        });

    } catch (error) {
        console.error("Ranking Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Ranking Agent failed",
                agent: "Ranking Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}