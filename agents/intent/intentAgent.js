const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const intentAgent = async (userInput) => {
    try {
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

Respond ONLY in valid JSON format, nothing else.`
                }
            ],
            temperature: 0.3,
        });

        const response = completion.choices[0].message.content;
        const cleaned = response.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return parsed;

    } catch (error) {
        console.error("Intent Agent Error:", error);
        return {
            error: true,
            message: "Could not process request",
            fallback: "Please describe your service need in simple terms"
        };
    }
};

module.exports = { intentAgent };