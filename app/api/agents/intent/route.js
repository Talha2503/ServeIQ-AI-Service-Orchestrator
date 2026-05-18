import { groq } from "../../../../lib/groqClient";

export async function POST(request) {
    try {
        const { userInput } = await request.json();

        if (!userInput) {
            return Response.json(
                { error: "No input provided", fallback: "Please describe your service need" },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are ServeIQ's Intent Agent for Pakistan's informal service economy.
Analyze service requests in any language (Urdu, Roman Urdu, English, or mixed).
Always respond in valid JSON only, no extra text.`
                },
                {
                    role: "user",
                    content: `Extract the following from this service request:
1. service_type: (AC Repair, Plumbing, Electrical, Tutoring, Beautician, Driver, Mechanic, Cleaning, Carpentry)
2. location: where the service is needed
3. preferred_time: when they want the service
4. budget_sensitivity: high/medium/low
5. urgency: high/medium/low
6. language_detected: urdu/roman_urdu/english/mixed
7. confidence_score: 0-100
8. confirmation_needed: true if confidence below 70
9. confirmation_question: ask if confidence is low
10. reasoning: step by step explanation

User Input: "${userInput}"

Respond ONLY in this exact JSON format:
{
  "service_type": "",
  "location": "",
  "preferred_time": "",
  "budget_sensitivity": "",
  "urgency": "",
  "language_detected": "",
  "confidence_score": 0,
  "confirmation_needed": false,
  "confirmation_question": "",
  "reasoning": "",
  "agent": "Intent Agent",
  "status": "success"
}`
                }
            ],
            temperature: 0.3,
        });

        const response = completion.choices[0].message.content;
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

        // Agent trace log
        console.log("╔════════════════════════════════╗");
        console.log("║      INTENT AGENT TRACE        ║");
        console.log("╠════════════════════════════════╣");
        console.log(`║ Input: ${userInput}`);
        console.log(`║ Language: ${parsed.language_detected}`);
        console.log(`║ Service: ${parsed.service_type}`);
        console.log(`║ Location: ${parsed.location}`);
        console.log(`║ Time: ${parsed.preferred_time}`);
        console.log(`║ Budget: ${parsed.budget_sensitivity}`);
        console.log(`║ Urgency: ${parsed.urgency}`);
        console.log(`║ Confidence: ${parsed.confidence_score}%`);
        console.log(`║ Reasoning: ${parsed.reasoning}`);
        console.log("╚════════════════════════════════╝");

        return Response.json(parsed);

    } catch (error) {
        console.error("Intent Agent Error:", error);
        return Response.json(
            {
                error: true,
                message: "Intent Agent failed to process request",
                fallback: "Please describe your service need in simple terms",
                agent: "Intent Agent",
                status: "error"
            },
            { status: 500 }
        );
    }
}