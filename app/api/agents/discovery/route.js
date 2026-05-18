import { readFile } from "fs/promises";
import { join } from "path";
import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { serviceType, location, preferredTime, budgetSensitivity, urgency } = await request.json();

        // Load mock provider data
        const providersPath = join(process.cwd(), "data", "providers.json");
        const providersData = JSON.parse(await readFile(providersPath, "utf8"));
        const providers = providersData.providers;

        // Filter providers by service type
        const matchingProviders = providers.filter((provider) =>
            provider.service_types.some((service) =>
                service.toLowerCase().includes(serviceType.toLowerCase()) ||
                serviceType.toLowerCase().includes(service.toLowerCase())
            )
        );

        if (matchingProviders.length === 0) {
            return Response.json({
                agent: "Discovery Agent",
                status: "no_providers_found",
                message: `No providers found for ${serviceType} in ${location}`,
                fallback: "Expanding search radius or trying alternate service categories",
                providers: [],
                reasoning: "No matching providers in mock dataset for requested service type"
            });
        }

        // Use Groq to reason about provider discovery
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Discovery Agent for Pakistan's informal service economy.
Your job is to analyze available providers and explain your discovery process.
Always respond in valid JSON only.`
                },
                {
                    role: "user",
                    content: `User needs: ${serviceType} in ${location}
Preferred time: ${preferredTime}
Budget sensitivity: ${budgetSensitivity}
Urgency: ${urgency}

Available providers found: ${JSON.stringify(matchingProviders.map(p => ({
                        id: p.id,
                        name: p.name,
                        area: p.location.area,
                        rating: p.rating,
                        on_time_score: p.on_time_score,
                        cancellation_rate: p.cancellation_rate,
                        hourly_rate: p.hourly_rate,
                        experience_years: p.experience_years
                    })))}

Analyze these providers and respond in this exact JSON format:
{
  "providers_found": 0,
  "search_area": "",
  "service_requested": "",
  "discovery_method": "mock_dataset",
  "reasoning": "explain how you found these providers",
  "note": "This is synthetic mock data for hackathon demonstration"
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
        console.log("║     DISCOVERY AGENT TRACE      ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Service Requested: ${serviceType}`);
        console.log(`║ Location: ${location}`);
        console.log(`║ Providers Found: ${matchingProviders.length}`);
        console.log(`║ Reasoning: ${parsed.reasoning}`);
        console.log("╚════════════════════════════════╝");

        return Response.json({
            agent: "Discovery Agent",
            status: "success",
            ...parsed,
            providers: matchingProviders,
        });

    } catch (error) {
        console.error("Discovery Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Discovery Agent failed",
                agent: "Discovery Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}