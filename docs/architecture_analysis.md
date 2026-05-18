# ServeIQ Architecture Analysis

## Overview

ServeIQ is designed as an AI Service Orchestrator for Pakistan's informal economy. The system currently implements a **Multi-Agent System (MAS)** architecture using independent Next.js API routes. Each agent is responsible for a discrete step in the service lifecycle, from initial intent understanding to post-service follow-up.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **AI/LLM Provider**: Groq Cloud (`groq-sdk`)
- **LLM Model**: `llama-3.3-70b-versatile` (used across all 8 agents for high reasoning capabilities and fast inference)
- **Data Layer**: Mock JSON dataset (`data/providers.json`) for synthetic provider data.

## Agent Architecture

The system consists of 8 independent, stateless micro-agents. Each agent is exposed as a POST endpoint under `/api/agents/[agent-name]`. 

### Key Characteristics:
1. **Stateless Operations**: Agents do not maintain persistent state between requests. All necessary context must be passed in the JSON payload of the request.
2. **JSON Strictness**: Prompts are explicitly engineered to enforce pure JSON responses without markdown formatting or conversational filler, ensuring machine-readability.
3. **Observability**: Each agent implements a custom console trace log (e.g., `╔════ INTENT AGENT TRACE ════╗`) to provide real-time visibility into the agent's internal reasoning and calculations.
4. **Deterministic + Probabilistic Fusion**: Several agents (like Ranking and Pricing) use deterministic code for mathematical calculations (e.g., base score calculation, surge pricing math) and then pass those calculated values to the LLM to generate natural language reasoning, explanations, and fairness notes.

## The 8 Agents

1. **Intent Agent** (`/api/agents/intent`): Processes multi-lingual input (Urdu, Roman Urdu, English), extracts 5 key parameters (service_type, location, time, budget, urgency), and calculates a confidence score to determine if user confirmation is needed.
2. **Discovery Agent** (`/api/agents/discovery`): Matches the extracted intent against the mock provider dataset, filtering for relevant service categories. Uses the LLM to reason about the discovery process.
3. **Ranking Agent** (`/api/agents/ranking`): Uses an 8-factor scoring algorithm (Rating, Reliability, Cancellation Rate, Experience, Budget, Risk, Sentiment, Capacity) to deterministically rank providers, then uses the LLM to explain the ranking decision based on user constraints (urgency, budget).
4. **Pricing Agent** (`/api/agents/pricing`): Calculates dynamic pricing factoring in base rates, urgency multipliers, time-based surge, loyalty discounts, and distance costs. Uses the LLM to generate transparent price breakdowns and budget alternatives.
5. **Booking Agent** (`/api/agents/booking`): Manages slot selection logic and generates booking IDs. Uses the LLM to simulate confirmation messages, SMS/WhatsApp texts, and calendar entries.
6. **Notification Agent** (`/api/agents/notification`): Generates a comprehensive communication payload for user/provider SMS and WhatsApp messages, including scheduled reminders (24h, 1h, en-route).
7. **Dispute Agent** (`/api/agents/dispute`): A post-booking agent that evaluates user claims against provider history. Recommends resolutions, refund amounts, and checks for blacklist criteria.
8. **Follow-up Agent** (`/api/agents/followup`): Handles post-service completion, verifies checklists, processes customer feedback, and calculates reputation score updates for providers.

## Missing Architectural Components

While the foundational agents are built and functional, the architecture currently lacks:
1. **The Orchestrator Layer**: A central state machine or coordinator that daisy-chains these independent agents together (e.g., calling Intent -> then Discovery -> then Ranking -> then Pricing -> then Booking).
2. **State Management**: A persistent store (like Redis or a database) to hold the context of the conversation and booking state across different user turns.
3. **User Interface (UI)**: A frontend to interact with the system (currently just the Next.js starter page).
