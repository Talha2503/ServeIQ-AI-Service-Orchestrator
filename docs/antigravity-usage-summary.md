# ServeIQ × Google Antigravity — Usage Summary
### Google Antigravity Hackathon 2026 Submission

> **Project:** ServeIQ — AI Service Orchestrator for Pakistan's Informal Economy  
> **Stack:** Next.js 16 (Turbopack), TypeScript, Framer Motion, Groq LLaMA 3.3  
> **Submitted by:** Talha  
> **Date:** May 2026

---

## 1. How Antigravity Was Used as the Main Orchestrator

Antigravity served as the **primary development intelligence layer** throughout the entire ServeIQ build — functioning not just as a code generator but as a true agentic pair programmer that made architectural decisions, debugged inter-agent state, and designed the full-stack UX pipeline end-to-end.

### Role Antigravity Played

| Responsibility | How Antigravity Fulfilled It |
|---|---|
| **System Architecture** | Designed the 8-agent orchestrator pipeline, defining how each agent's output feeds as input to the next |
| **API Design** | Authored the central `/api/orchestrator/route.js` that coordinates all agent actions via a state machine |
| **Full-Stack Component Generation** | Built every page (`/services`, `/chatbot`, `/booking`, `/providers`, `/followup`, `/dispute`, `/trace`) from scratch |
| **State Management Strategy** | Decided to use `workflowState` as a shared context object passed between API calls, preserving agent outputs across steps |
| **Data Flow Debugging** | Diagnosed booking data mismatches (e.g. `data.state.booking.booking` vs `data.booking.booking`) and fixed navigation params |
| **Design System** | Established and enforced the dark-blue `#050816` glassmorphism theme with Framer Motion animation patterns consistently across all routes |
| **Routing Decisions** | Designed the dual-entry UX (`/services` for GUI flow, `/chatbot` for conversational flow) both converging at `/booking` |

### The Orchestration Pattern

Antigravity treated each user request as a **multi-step agentic task**, following a consistent workflow:

1. **Research** — Read existing files before making changes
2. **Plan** — Identify minimal surgical edits vs. full rewrites
3. **Execute** — Write code respecting the established design system
4. **Verify** — Cross-check data shapes against API responses

This mirrors exactly how ServeIQ's own AI pipeline works — intent → discovery → ranking → pricing → booking — reinforcing the "agentic AI for agentic AI" nature of the project.

---

## 2. Complete List of Artifacts Generated

### Pages (Next.js App Router)

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — hero, 8-agent feature grid, terminal demo, CTA |
| `/services` | `app/services/page.tsx` | **[NEW]** 4-step service selection wizard (category → details → providers → pricing → booking) |
| `/chatbot` | `app/chatbot/page.tsx` | WhatsApp-style conversational booking interface |
| `/booking` | `app/booking/page.tsx` | Full receipt page with price breakdown, provider info, and action buttons |
| `/providers` | `app/providers/page.tsx` | Ranked provider list with AI score cards |
| `/provider/[id]` | `app/provider/page.tsx` | Individual provider detail page |
| `/followup` | `app/followup/page.tsx` | Post-service feedback and tracking |
| `/dispute` | `app/dispute/page.tsx` | AI-powered dispute resolution interface |
| `/trace` | `app/trace/page.tsx` | Agent trace log viewer |
| `/baseline` | `app/baseline/page.tsx` | Baseline comparison page for hackathon evaluation |

### API Routes

| Endpoint | File | Description |
|---|---|---|
| `/api/orchestrator` | `app/api/orchestrator/route.js` | Central state machine — dispatches to all 8 agents |
| `/api/agents/intent` | `app/api/agents/intent/` | NLP intent extraction (Urdu/Roman Urdu/English) |
| `/api/agents/discovery` | `app/api/agents/discovery/` | Provider database query + filtering |
| `/api/agents/ranking` | `app/api/agents/ranking/` | 8-factor deterministic scoring algorithm |
| `/api/agents/pricing` | `app/api/agents/pricing/` | Dynamic pricing with surge, urgency, loyalty |
| `/api/agents/booking` | `app/api/agents/booking/` | Slot confirmation + booking ID generation |
| `/api/agents/notification` | `app/api/agents/notification/` | Multi-channel SMS/WhatsApp payload generation |
| `/api/agents/followup` | `app/api/agents/followup/` | Post-service reputation + feedback pipeline |
| `/api/agents/dispute` | `app/api/agents/dispute/` | Complaint resolution + refund logic |

### Agent Logic Files

| Agent | Directory |
|---|---|
| Intent Agent | `agents/intent/` |
| Discovery Agent | `agents/discovery/` |
| Ranking Agent | `agents/ranking/` |
| Pricing Agent | `agents/pricing/` |
| Booking Agent | `agents/booking/` |
| Notification Agent | `agents/notification/` |
| Follow-up Agent | `agents/followup/` |
| Dispute Agent | `agents/dispute/` |

### Documentation

| File | Description |
|---|---|
| `docs/walkthrough.md` | Per-agent input/output documentation |
| `docs/architecture_analysis.md` | System architecture deep-dive |
| `docs/implementation_plan.md` | Initial build plan |
| `docs/code_review.md` | Quality review notes |
| `docs/antigravity-usage-summary.md` | **This document** |
| `README.md` | Project overview |

---

## 3. Agent Pipeline Workflow Designed in Antigravity

Antigravity designed the full pipeline as a **stateful multi-step orchestration** pattern. The central insight was to maintain a single `state` object that accumulates context as it flows through agents:

```
User Input (natural language)
        │
        ▼
┌─────────────────────┐
│   INTENT AGENT      │  → Extracts: service_type, location,
│  /api/agents/intent │    preferred_time, budget_sensitivity,
└─────────────────────┘    urgency, confidence_score
        │
        ▼
┌─────────────────────┐
│  DISCOVERY AGENT    │  → Queries providers.json by service
│ /api/agents/discov  │    type + location filter
└─────────────────────┘    Output: matched providers[]
        │
        ▼
┌─────────────────────┐
│   RANKING AGENT     │  → 8-factor scoring:
│ /api/agents/ranking │    Rating, On-time, Cancellation,
└─────────────────────┘    Experience, Budget, Risk,
        │                  Sentiment, Capacity
        ▼ (user selects provider)
┌─────────────────────┐
│   PRICING AGENT     │  → Calculates: base_cost + urgency +
│ /api/agents/pricing │    surge + distance - loyalty_discount
└─────────────────────┘    Output: final_price, budget_alternative
        │ (user confirms)
        ▼
┌─────────────────────┐
│   BOOKING AGENT     │  → Finds available slot, generates
│ /api/agents/booking │    booking_id, date, time
└─────────────────────┘    Output: confirmed booking object
        │
        ▼
┌─────────────────────┐
│ NOTIFICATION AGENT  │  → Generates SMS + WhatsApp payloads
│ /api/agents/notif   │    in Roman Urdu for user + provider
└─────────────────────┘    Schedules: 24h, 1h, en-route alerts
        │
        ▼
┌──────────────────────┐   ┌──────────────────────┐
│   FOLLOW-UP AGENT    │   │    DISPUTE AGENT      │
│ (post-service flow)  │   │  (complaint handler)  │
└──────────────────────┘   └──────────────────────┘
```

### State Object Design (Antigravity Decision)

Antigravity chose to pass a single accumulating `state` object through the orchestrator rather than making agents independently stateless. This allowed:

- Any agent to access any prior agent's output
- The frontend to restore full context from a single `workflowState`
- Debugging via the `/trace` page which renders the full state tree

---

## 4. Key Development Decisions Made Using Antigravity

### Decision 1: Dual Entry Points → Single Booking Receipt
Antigravity designed two separate UX flows that both converge at the same `/booking` receipt page:
- **`/services`** — GUI wizard for users who prefer structured selection
- **`/chatbot`** — Conversational interface for natural language input

The convergence was solved by using `sessionStorage` as a universal data bus (instead of URL params which have length limits) combined with URL param fallback for chatbot deep links.

### Decision 2: `workflowState` as Frontend State Machine
Rather than making separate API calls from the frontend for each agent, Antigravity designed the orchestrator to act as a single endpoint with an `action` parameter:
```
action: "process_intent" → runs Intent + Discovery + Ranking
action: "get_pricing"    → runs Pricing Agent
action: "confirm_booking" → runs Booking + Notification Agents
```
This kept the frontend clean and prevented race conditions between parallel agent calls.

### Decision 3: 8-Factor Ranking Algorithm
Antigravity specified a deterministic (non-LLM) scoring model for the Ranking Agent to ensure consistent, explainable results — critical for trust in Pakistan's informal economy context where provider accountability matters:

| Factor | Weight |
|---|---|
| Star Rating | 25% |
| On-time Score | 20% |
| Cancellation Rate | 15% |
| Experience Years | 15% |
| Budget Match | 10% |
| Risk Score | 8% |
| Sentiment Score | 5% |
| Availability Capacity | 2% |

### Decision 4: Framer Motion Design System
Antigravity enforced a consistent animation vocabulary across all pages:
- `containerVariants` with `staggerChildren: 0.1` for list entrances
- `itemVariants` with `y: 20 → 0, opacity: 0 → 1` for individual items
- `AnimatePresence mode="wait"` for page-step transitions
- Fixed glassmorphic header pattern with `backdrop-blur-md`

### Decision 5: Multi-lingual Intent Processing
Antigravity designed the Intent Agent to handle three input modes without explicit language detection:
- **Urdu script** (Unicode)
- **Roman Urdu** (transliterated)
- **English**

The LLM prompt was structured to extract entities regardless of language, returning a normalized JSON schema.

---

## 5. Vibe Coding Sessions Summary

The entire ServeIQ codebase was built through **iterative vibe coding sessions** with Antigravity across approximately 8 conversations spanning 2 days.

### Session Timeline

| Session | Focus | Key Output |
|---|---|---|
| **Session 1** | Architecting the orchestrator | Intent Agent API route, multi-lingual NLP prompt design, confidence scoring |
| **Session 2** | Landing page transformation | Full `app/page.tsx` redesign — dark cyberpunk aesthetic, typed animation, agent feature grid |
| **Session 3** | Transforming landing page | Premium dark blue SaaS aesthetic with Framer Motion, glassmorphism, gradient system |
| **Session 4** | Baseline comparison page | `/baseline` route mirroring landing page with adjusted navigation |
| **Session 5** | Provider List page | `/providers` with ranked provider cards, AI score display, demo data integration |
| **Session 6** | Chatbot enhancements | "View Full Receipt" button, receipt data routing, `workflowState` navigation |
| **Session 7** | Services wizard page | Full `/services` 4-step wizard — category cards, details form, provider list, pricing confirm |
| **Session 8** | Final routing fixes | `sessionStorage` data bus, "Book a Service" → `/services`, booking param normalization |

### Vibe Coding Highlights

**Instant full-page generation:** Antigravity generated complete production-quality pages in single turns — the 519-line `/services/page.tsx` was written entirely in one response with proper TypeScript types, Framer Motion animations, API integration, and error handling.

**Surgical precision edits:** When the user made their own changes, Antigravity read the diffs and made minimal targeted fixes (2–3 line changes) rather than rewriting files.

**Design consistency enforcement:** Antigravity maintained the exact same color tokens, animation patterns, and component structures across 10+ pages without a design system file — purely from pattern recognition across the codebase.

**State debugging:** When booking data was arriving in unexpected shapes (`data.state.booking.booking` vs `data.booking.booking`), Antigravity traced the orchestrator response structure and fixed the extraction path without requiring a test run.

---

## Summary Statistics

| Metric | Value |
|---|---|
| Total pages built with Antigravity | 10 |
| Total API routes | 10 |
| Total agents implemented | 8 |
| Lines of code generated | ~6,000+ |
| Antigravity conversations | ~8 sessions |
| Build time (concept → functional app) | ~2 days |
| Manual code written by developer | ~15% (configuration, tweaks) |
| Code generated by Antigravity | ~85% |

---

> *ServeIQ demonstrates that Antigravity can serve as the primary engineering intelligence for a full-stack, multi-agent AI application — from system design through production-quality UI implementation.*
