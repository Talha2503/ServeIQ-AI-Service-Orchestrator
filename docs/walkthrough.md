# ServeIQ Agents Walkthrough

ServeIQ utilizes 8 specialized AI agents working together to orchestrate services for the informal economy. Below is a walkthrough of what each agent does, their inputs, and how they contribute to the system.

## 1. Intent Agent
**Endpoint:** `/api/agents/intent`
The Intent Agent is the entry point for understanding user requests. It supports Urdu, Roman Urdu, and English, determining exactly what service the user needs.
- **Input:** Natural language user input (e.g., "Mujhe AC theek karwana hai kal subah").
- **Output:** Extracted JSON with `service_type`, `location`, `preferred_time`, `budget_sensitivity`, `urgency`, and a `confidence_score`.

## 2. Discovery Agent
**Endpoint:** `/api/agents/discovery`
Once the intent is known, the Discovery Agent queries the synthetic provider database (`data/providers.json`) to find workers that match the requested service type and location.
- **Input:** Service type, location, preferred time, budget, and urgency from the Intent Agent.
- **Output:** A list of available providers, along with AI-generated reasoning on why these providers match the user's needs.

## 3. Ranking Agent
**Endpoint:** `/api/agents/ranking`
The Ranking Agent evaluates the discovered providers against an 8-factor deterministic scoring model (Rating, On-time Score, Cancellation Rate, Experience, Budget Match, Risk Score, Sentiment, and Capacity).
- **Input:** The list of providers from the Discovery Agent, plus user constraints (urgency, budget).
- **Output:** The providers sorted by `total_score`, alongside an AI-generated explanation of the top pick and how budget/urgency factored into the ranking.

## 4. Pricing Agent
**Endpoint:** `/api/agents/pricing`
Before confirming a booking, the Pricing Agent calculates the final cost. It takes the provider's base rate and applies multipliers for urgency, time-based surge, distance, and loyalty discounts.
- **Input:** The selected provider, service type, urgency, and budget constraints.
- **Output:** A transparent price breakdown, calculating the `final_price` and offering a `budget_alternative` if the user is highly budget-sensitive.

## 5. Booking Agent
**Endpoint:** `/api/agents/booking`
The Booking Agent secures the provider's time slot based on the user's preferred time.
- **Input:** The chosen provider, service type, location, preferred time, and the calculated pricing data.
- **Output:** A confirmed `booking_id`, the scheduled date/time, and simulated SMS/WhatsApp confirmation texts. If no slot is available, it handles waitlisting logic.

## 6. Notification Agent
**Endpoint:** `/api/agents/notification`
To keep all parties informed, the Notification Agent generates multi-channel communication payloads.
- **Input:** The completed booking details, provider details, and pricing.
- **Output:** Scheduled notifications including immediate SMS/WhatsApp confirmations, 24-hour reminders, 1-hour reminders, and "provider en-route" alerts in Roman Urdu/Urdu.

## 7. Dispute Agent
**Endpoint:** `/api/agents/dispute`
In cases where things go wrong, the Dispute Agent steps in. It evaluates user complaints against the provider's historical performance (like cancellation rate and risk score).
- **Input:** The booking details, provider track record, and the user's dispute description.
- **Output:** An impartial resolution decision, suggesting a refund amount (if any), determining if the provider needs to be penalized or blacklisted, and generating resolution messages.

## 8. Follow-up Agent
**Endpoint:** `/api/agents/followup`
Once a service is completed, the Follow-up Agent handles the post-service workflow.
- **Input:** The completed booking, completion checklists (photos/signatures), and customer feedback/ratings.
- **Output:** An updated provider reputation score, a calculated impact on the provider's future matching priority, and a thank-you SMS to the customer.

---
> [!NOTE]
> All agents log an "Agent Trace" in the server console, allowing developers to see the exact reasoning and calculations happening under the hood.
