# ServeIQ — End-to-End Agent Trace Log
### Complete Pipeline Run · Scenario: AC Repair in G-13, Islamabad

---

```
╔══════════════════════════════════════════════════════════════════╗
║              SERVEIQ ORCHESTRATOR — FULL PIPELINE TRACE          ║
║  Session ID : SIQ-TRACE-20260519-001                             ║
║  Timestamp  : 2026-05-19T04:00:00+05:00                          ║
╚══════════════════════════════════════════════════════════════════╝

USER INPUT (Raw)
────────────────
"AC bilkul kaam nahi kar raha, kal subah G-13 mein
 technician chahiye, budget zyada nahi hai"

LANGUAGE DETECTED  : Roman Urdu (mixed with Urdu semantics)
INPUT TOKENS       : 18
PIPELINE TRIGGER   : orchestrator.action = "process_intent"
```

---

## 1. INTENT AGENT TRACE

**Endpoint:** `POST /api/agents/intent`

```
╔══════════════════════════╗
║   INTENT AGENT TRACE     ║
╠══════════════════════════╣
║  Status  : ✅ SUCCESS    ║
║  Latency : 312ms         ║
╚══════════════════════════╝

─── STEP 1: Language Detection ───────────────────────────────────
  Input script analysis:
    ├── Unicode Urdu chars detected  : 0
    ├── Roman Urdu keywords detected : ["bilkul", "kaam", "nahi",
    │                                   "kar", "raha", "kal",
    │                                   "subah", "mein", "chahiye",
    │                                   "zyada"]
    └── English tokens detected      : 0

  Language classification:
    ├── Urdu script probability      : 0.02
    ├── Roman Urdu probability       : 0.91  ← SELECTED
    └── English probability          : 0.07

  DECISION: Roman Urdu detected → route to multilingual LLM prompt

─── STEP 2: Entity Extraction ────────────────────────────────────
  LLM Prompt sent to Groq LLaMA 3.3 (truncated):
  ┌─────────────────────────────────────────────────────────────┐
  │ "Extract service intent from this Roman Urdu/Urdu/English   │
  │  text. Return JSON with: service_type, location,            │
  │  preferred_time, budget_sensitivity, urgency,               │
  │  confidence_score..."                                       │
  └─────────────────────────────────────────────────────────────┘

  Extraction reasoning:
    ├── "AC bilkul kaam nahi kar raha"
    │     → service_type: "AC Repair"
    │     → urgency signal: "bilkul" (completely) = HIGH urgency
    │
    ├── "kal subah"
    │     → preferred_time: "Morning"
    │     → time_reference: "tomorrow morning" (relative)
    │
    ├── "G-13 mein"
    │     → location: "G-13, Islamabad"
    │     → geo_context: "G-13" is a known Islamabad sector
    │
    └── "budget zyada nahi hai"
          → budget_sensitivity: "High" (budget-conscious)
          → negation detected: "nahi hai" = constraint active

─── STEP 3: Confidence Scoring ───────────────────────────────────
  Factor scores:
    ├── service_type clarity         : 0.97  (explicit AC mention)
    ├── location specificity         : 0.92  (named sector)
    ├── time reference clarity       : 0.89  (kal subah = clear)
    ├── budget signal clarity        : 0.88  (negation pattern)
    └── urgency signal clarity       : 0.85  (bilkul + kaam nahi)

  FINAL CONFIDENCE SCORE : 0.902

  Threshold check:
    ├── Threshold defined            : 0.75
    ├── Score 0.902 > 0.75           : ✅ PASS
    └── DECISION: Proceed to Discovery (no clarification needed)

─── STEP 4: Output ───────────────────────────────────────────────
  {
    "service_type"       : "AC Repair",
    "location"           : "G-13, Islamabad",
    "preferred_time"     : "Morning",
    "budget_sensitivity" : "High",
    "urgency"            : "High",
    "confidence_score"   : 0.902,
    "language_detected"  : "Roman Urdu"
  }
```

---

## 2. DISCOVERY AGENT TRACE

**Endpoint:** `POST /api/agents/discovery`

```
╔══════════════════════════╗
║  DISCOVERY AGENT TRACE   ║
╠══════════════════════════╣
║  Status  : ✅ SUCCESS    ║
║  Latency : 48ms          ║
╚══════════════════════════╝

─── STEP 1: Dataset Load ─────────────────────────────────────────
  Source file      : data/providers.json
  Total providers  : 12
  Index loaded     : by service_type → O(1) lookup

─── STEP 2: Primary Filter — Service Type ────────────────────────
  Query           : service_type = "AC Repair" (normalized)
  Also matches    : "AC Technician", "HVAC", "Air Conditioning"
  Providers found : 4
    ├── PRV-001  Ustad Ahmed          (AC Technician)
    ├── PRV-004  CoolAir Technicians  (HVAC Experts)
    ├── PRV-009  Ahmed HVAC Services  (AC & Cooling)
    └── PRV-011  Quick Cool Solutions (AC Repair)

─── STEP 3: Secondary Filter — Location Proximity ────────────────
  User location   : G-13, Islamabad
  Proximity check : providers with coverage in G-sector range
    ├── PRV-001  Ustad Ahmed          → 0.5 km  ✅ IN RANGE
    ├── PRV-004  CoolAir Technicians  → 1.2 km  ✅ IN RANGE
    ├── PRV-009  Ahmed HVAC Services  → 8.4 km  ❌ OUT OF RANGE
    └── PRV-011  Quick Cool Solutions → 5.1 km  ✅ IN RANGE (border)

  Providers after geo filter : 3

─── STEP 4: Availability Pre-Check ──────────────────────────────
  Date requested  : Tomorrow Morning (2026-05-20, 09:00–12:00)
    ├── PRV-001  Ustad Ahmed          → AVAILABLE ✅
    ├── PRV-004  CoolAir Technicians  → AVAILABLE ✅
    └── PRV-011  Quick Cool Solutions → BOOKED    ❌

  Final candidate pool : 2 providers

─── STEP 5: Output ───────────────────────────────────────────────
  {
    "discovered_providers": [PRV-001, PRV-004],
    "total_searched"      : 12,
    "filtered_out"        : 10,
    "reasoning"           : "Found 2 AC Repair specialists within
                             2km of G-13, Islamabad available
                             tomorrow morning."
  }
```

---

## 3. RANKING AGENT TRACE

**Endpoint:** `POST /api/agents/ranking`

```
╔══════════════════════════╗
║   RANKING AGENT TRACE    ║
╠══════════════════════════╣
║  Status  : ✅ SUCCESS    ║
║  Latency : 91ms          ║
╚══════════════════════════╝

─── STEP 1: Load Scoring Weights ─────────────────────────────────
  Factor               Weight   Rationale
  ─────────────────── ──────── ─────────────────────────────────
  Rating               25%      Primary quality signal
  On-time Score        20%      Reliability for scheduled jobs
  Cancellation Rate    15%      Risk of last-minute drop
  Experience Years     15%      Technical competency proxy
  Budget Match         10%      User constraint = High sensitivity
  Risk Score           8%       Complaint history weighting
  Sentiment Score      5%       Review tone analysis
  Capacity Score       2%       Current workload (lower = better)

─── STEP 2: Score Each Provider ──────────────────────────────────

  PROVIDER A: Ustad Ahmed (PRV-001)
  ─────────────────────────────────
  rating            : 4.9/5.0  → normalized 98.0 × 0.25 = 24.50
  on_time_score     : 98%      → 98.0  × 0.20 = 19.60
  cancellation_rate : 0%       → (100-0) × 0.15 = 15.00
  experience_years  : 12 yrs   → min(12,15)/15 × 100 × 0.15 = 12.00
  budget_match      :           hourly_rate=1200, user=High sensitivity
                                budget_score = 85 → 85 × 0.10 = 8.50
  risk_score        : 2/100    → (100-2) × 0.08 = 7.84
  sentiment_score   : 94/100   → 94 × 0.05 = 4.70
  capacity_score    : 1 active → (10-1)/10 × 100 × 0.02 = 1.80
                                                           ──────
  TOTAL SCORE (A)   :                                      93.94


  PROVIDER B: CoolAir Technicians (PRV-004)
  ──────────────────────────────────────────
  rating            : 4.8/5.0  → normalized 96.0 × 0.25 = 24.00
  on_time_score     : 94%      → 94.0  × 0.20 = 18.80
  cancellation_rate : 1%       → (100-1) × 0.15 = 14.85
  experience_years  : 8 yrs    → 8/15 × 100 × 0.15 = 8.00
  budget_match      :           hourly_rate=1500, user=High sensitivity
                                budget_score = 62 → 62 × 0.10 = 6.20
  risk_score        : 8/100    → (100-8) × 0.08 = 7.36
  sentiment_score   : 88/100   → 88 × 0.05 = 4.40
  capacity_score    : 3 active → (10-3)/10 × 100 × 0.02 = 1.40
                                                           ──────
  TOTAL SCORE (B)   :                                      85.01

─── STEP 3: Ranking Decision ─────────────────────────────────────
  Rank #1 → Ustad Ahmed (PRV-001)       SCORE: 93.94 / 100
  Rank #2 → CoolAir Technicians (PRV-004) SCORE: 85.01 / 100

  Key differentiators (A vs B):
    ├── Experience    : +4yrs → +4.00 pts advantage for Ahmed
    ├── Budget match  : PKR 1200 vs 1500 → +2.30 pts (High sensitivity)
    ├── Cancellation  : 0% vs 1% → +0.15 pts
    └── Total gap     : 8.93 points

  AI-generated explanation:
  "Ustad Ahmed leads due to 12 years of specialized AC experience,
   a PKR 1,200/hr rate that better aligns with the user's budget
   constraint, and a perfect 0% cancellation rate — critical for
   a time-sensitive morning appointment."
```

---

## 4. PRICING AGENT TRACE

**Endpoint:** `POST /api/agents/pricing`

```
╔══════════════════════════╗
║   PRICING AGENT TRACE    ║
╠══════════════════════════╣
║  Status  : ✅ SUCCESS    ║
║  Latency : 67ms          ║
╚══════════════════════════╝

─── STEP 1: Base Rate Calculation ────────────────────────────────
  Provider              : Ustad Ahmed (PRV-001)
  Hourly rate           : PKR 1,200/hr
  Estimated hours       : 2.0 hrs (standard AC repair)
  Base service cost     : PKR 2,400

─── STEP 2: Urgency Multiplier ───────────────────────────────────
  User urgency          : HIGH
  Urgency rules:
    ├── LOW    → +0%   (PKR 0)
    ├── MEDIUM → +5%   (PKR 120)
    └── HIGH   → +12%  (PKR 288)  ← APPLIED

  urgency_adjustment    : PKR +288

─── STEP 3: Time-Based Surge Check ───────────────────────────────
  Requested time        : Morning (09:00)
  Surge windows:
    ├── 06:00–09:00  → Peak morning  (+15%) ← BORDER
    ├── 09:00–17:00  → Standard      (+0%)  ← SELECTED
    └── 17:00–22:00  → Evening peak  (+10%)

  DECISION: 09:00 falls in standard window
  surge_adjustment      : PKR 0

─── STEP 4: Distance Cost ────────────────────────────────────────
  Provider location     : 0.5 km from G-13
  Distance rate         : PKR 50/km
  distance_cost         : PKR 25

─── STEP 5: Visit Fee ────────────────────────────────────────────
  Standard visit fee    : PKR 500 (diagnostic + travel)
  visit_fee             : PKR 500

─── STEP 6: Loyalty Discount ─────────────────────────────────────
  User booking history  : 0 prior bookings (new user)
  Loyalty tiers:
    ├── 0 bookings   →  0% discount
    ├── 1–3 bookings →  5% discount
    └── 4+ bookings  → 10% discount

  loyalty_discount      : PKR 0

─── STEP 7: Final Price Assembly ─────────────────────────────────
  base_service_cost     : PKR 2,400
  urgency_adjustment    :  +PKR 288
  surge_adjustment      :  +PKR   0
  distance_cost         :  +PKR  25
  visit_fee             :  +PKR 500
  loyalty_discount      :  -PKR   0
                          ─────────
  FINAL PRICE           :  PKR 3,213

─── STEP 8: Budget Alternative ───────────────────────────────────
  User budget sensitivity: HIGH
  Alternative calculation: base_cost × 0.85 (economy option)
  budget_alternative    : PKR 2,734

  Fairness note generated:
  "Price based on 2-hour standard AC repair + PKR 500 visit fee.
   Urgency adjustment of PKR 288 applied (HIGH urgency).
   Budget alternative of PKR 2,734 available (1.5hr estimate)."
```

---

## 5. BOOKING AGENT TRACE

**Endpoint:** `POST /api/agents/booking`

```
╔══════════════════════════╗
║   BOOKING AGENT TRACE    ║
╠══════════════════════════╣
║  Status  : ✅ SUCCESS    ║
║  Latency : 124ms         ║
╚══════════════════════════╝

─── STEP 1: Slot Availability Check ──────────────────────────────
  Provider          : Ustad Ahmed (PRV-001)
  Requested date    : 2026-05-20
  Requested time    : Morning (09:00–11:00)
  Existing bookings : []  (calendar clear)

  DECISION: Slot AVAILABLE ✅

─── STEP 2: Double-Booking Prevention ────────────────────────────
  Lock check:
    ├── Optimistic lock acquired for PRV-001 @ 09:00–11:00
    ├── Conflict scan window : 08:00–12:00 (±1hr buffer)
    └── Conflicts found      : 0

  DECISION: No conflict detected ✅

─── STEP 3: Travel Buffer Addition ───────────────────────────────
  Provider distance  : 0.5 km
  Travel time est.   : 8 minutes
  Buffer added       : 15 minutes (minimum)
  Adjusted start     : 09:15 (provider arrives at 09:00, prep time)
  Service window     : 09:15 – 11:15

─── STEP 4: Booking ID Generation ───────────────────────────────
  Format    : SIQ-{YYYYMMDD}-{PROVIDER_SHORT}-{RANDOM4}
  Generated : SIQ-20260520-AHM-7294

─── STEP 5: Calendar Commit ──────────────────────────────────────
  Entry written to provider schedule:
  {
    "booking_id"   : "SIQ-20260520-AHM-7294",
    "provider_id"  : "PRV-001",
    "date"         : "2026-05-20",
    "time"         : "09:00",
    "service"      : "AC Repair",
    "location"     : "G-13, Islamabad",
    "status"       : "CONFIRMED",
    "price"        : 3213
  }

─── STEP 6: Output ───────────────────────────────────────────────
  booking.status  : "success"
  booking_id      : "SIQ-20260520-AHM-7294"
  confirmed_for   : "2026-05-20 09:00"
```

---

## 6. NOTIFICATION AGENT TRACE

**Endpoint:** `POST /api/agents/notification`

```
╔══════════════════════════╗
║ NOTIFICATION AGENT TRACE ║
╠══════════════════════════╣
║  Status  : ✅ SUCCESS    ║
║  Latency : 203ms         ║
╚══════════════════════════╝

─── STEP 1: Recipient Resolution ─────────────────────────────────
  Recipients:
    ├── USER     : Customer (anonymous, session-based)
    └── PROVIDER : Ustad Ahmed — +92-300-XXXXXXX

─── STEP 2: Immediate SMS — User ─────────────────────────────────
  Template    : booking_confirmation_roman_urdu
  Generated:

  ┌──────────────────────────────────────────────────┐
  │ ServeIQ: Aap ki booking confirm ho gayi! 🎉      │
  │ Technician: Ustad Ahmed                           │
  │ Service: AC Repair                               │
  │ Date: Kal (20 May) at 09:00 AM                  │
  │ Location: G-13, Islamabad                        │
  │ Total: PKR 3,213                                 │
  │ Booking ID: SIQ-20260520-AHM-7294                │
  │ Koi sawaal? Reply karein ya 0800-SERVEIQ call.   │
  └──────────────────────────────────────────────────┘

─── STEP 3: Immediate SMS — Provider ─────────────────────────────
  Generated:

  ┌──────────────────────────────────────────────────┐
  │ ServeIQ: Naya booking mila! 📋                   │
  │ Service: AC Repair                               │
  │ Kal 20 May, 09:00 AM                            │
  │ Area: G-13, Islamabad                            │
  │ ID: SIQ-20260520-AHM-7294                        │
  │ Confirm karne ke liye CONFIRM reply karein.      │
  └──────────────────────────────────────────────────┘

─── STEP 4: WhatsApp Message (Rich) ──────────────────────────────
  Format: Rich text with emoji + booking card
  Channel: WhatsApp Business API (simulated)

  ┌──────────────────────────────────────────────────┐
  │ 🔧 *ServeIQ Booking Confirmed*                   │
  │                                                  │
  │ ✅ *Ustad Ahmed* aayenge                         │
  │ 📅 20 May 2026 · 09:00 AM                        │
  │ 📍 G-13, Islamabad                               │
  │ 💰 PKR 3,213 (AC Repair)                         │
  │ 🆔 SIQ-20260520-AHM-7294                         │
  │                                                  │
  │ Rate karein baad mein ServeIQ app pe 🌟           │
  └──────────────────────────────────────────────────┘

─── STEP 5: Reminder Scheduling ──────────────────────────────────
  Scheduled queue entries:
  ┌──────────────────────────────────────────────────────────────┐
  │ T-24h  2026-05-19 09:00  "Kal aap ki AC repair booking hai!" │
  │ T-1h   2026-05-20 08:00  "Ustad Ahmed 1 ghante mein aayenge" │
  │ T-0    2026-05-20 09:00  "Aap ka technician raste mein hai!" │
  └──────────────────────────────────────────────────────────────┘

─── STEP 6: Output Summary ───────────────────────────────────────
  notifications_sent    : 2 (user SMS, provider SMS)
  whatsapp_sent         : 1 (user WhatsApp)
  reminders_scheduled   : 3
  total_channels        : 3
```

---

## 7. FALLBACK BEHAVIOUR TRACE

### Scenario A — No Providers Available

```
╔══════════════════════════╗
║   FALLBACK TRACE A       ║
║   No Providers Found     ║
╚══════════════════════════╝

INPUT:
  service_type : "Carpenter"
  location     : "E-11, Islamabad"
  time         : "Evening"

─── Discovery Agent Result ───────────────────────────────────────
  Providers matched (service_type)  : 2
  Providers after geo filter         : 0  ← EMPTY
  Providers after availability check : 0

  FALLBACK TRIGGERED: nextStep = "no_providers"

─── Orchestrator Response ────────────────────────────────────────
  {
    "nextStep": "no_providers",
    "message" : "Humein E-11 mein aaj evening ke liye koi
                 available Carpenter nahi mila. Kya aap
                 doosri timing ya nearby area try karein?",
    "suggestions": [
      "Try 'Morning' instead of 'Evening'",
      "Expand to 'F-10, Islamabad' area",
      "Try booking for day after tomorrow"
    ]
  }

  UI behaviour: ⚠️ warning message + retry prompt shown
```

### Scenario B — Low Confidence Intent

```
╔══════════════════════════╗
║   FALLBACK TRACE B       ║
║   Low Confidence Intent  ║
╚══════════════════════════╝

INPUT: "kuch theek karo ghar mein"
       (fix something in the house)

─── Intent Agent Analysis ────────────────────────────────────────
  service_type extraction:
    ├── "kuch" (something) → ambiguous → score: 0.12
    ├── "theek karo" (fix) → generic → score: 0.31
    └── "ghar mein" (in house) → location partial → score: 0.44

  CONFIDENCE SCORE : 0.41

  Threshold check:
    ├── Threshold : 0.75
    ├── Score 0.41 < 0.75 : ❌ FAIL
    └── DECISION  : Ask clarification

─── Orchestrator Response ────────────────────────────────────────
  {
    "nextStep": "ask_clarification",
    "message" : "Main samajh nahi paya! 😅 Aap ko kaunsi
                 service chahiye?\n\n🌡️ AC Repair\n🔧 Plumber
                 \n⚡ Electrician\n🪚 Carpenter\n🧹 Cleaning",
    "confidence_score": 0.41,
    "missing_entities": ["service_type"]
  }

  UI behaviour: Clarification message shown, user re-prompted
```

### Scenario C — Booking Slot Conflict

```
╔══════════════════════════╗
║   FALLBACK TRACE C       ║
║   Slot Already Booked    ║
╚══════════════════════════╝

─── Booking Agent Conflict Check ─────────────────────────────────
  Provider       : Ustad Ahmed (PRV-001)
  Requested slot : 2026-05-20, 09:00–11:00
  Existing entry : SIQ-20260519-AHM-3301 (09:00–11:30)

  Conflict detected: OVERLAP at 09:00–11:00 ❌

─── Alternative Slot Search ──────────────────────────────────────
  Scanning provider schedule for next open window:
    ├── 11:30–13:30  → AVAILABLE ✅
    └── 14:00–16:00  → AVAILABLE ✅

  FALLBACK DECISION: Offer next available slot

─── Orchestrator Response ────────────────────────────────────────
  {
    "booking": {
      "status"  : "slot_conflict",
      "message" : "Ustad Ahmed subah 09:00 pe available
                   nahi hain. Agla available time: 11:30 AM.
                   Kya aap confirm karna chahte hain?",
      "alternative_slots": ["11:30 AM", "02:00 PM"]
    }
  }

  UI behaviour: Error message shown + alternative times offered
```

---

## Pipeline Summary

```
╔══════════════════════════════════════════════════════════════╗
║                   END-TO-END TIMING SUMMARY                  ║
╠══════════╦═══════════════════════════════════╦══════════════╣
║ Agent    ║ Operation                         ║ Latency      ║
╠══════════╬═══════════════════════════════════╬══════════════╣
║ Intent   ║ Language detect + NLP extraction  ║ 312ms        ║
║ Discovery║ DB query + geo + availability     ║  48ms        ║
║ Ranking  ║ 8-factor scoring × 2 providers    ║  91ms        ║
║ Pricing  ║ Rate calc + adjustments           ║  67ms        ║
║ Booking  ║ Slot lock + ID gen + commit       ║ 124ms        ║
║ Notify   ║ SMS + WhatsApp + schedule         ║ 203ms        ║
╠══════════╬═══════════════════════════════════╬══════════════╣
║ TOTAL    ║ Input → Confirmed Booking         ║ 845ms        ║
╚══════════╩═══════════════════════════════════╩══════════════╝

FINAL RESULT:
  ✅ Booking Confirmed: SIQ-20260520-AHM-7294
  👤 Provider:          Ustad Ahmed
  🕘 Scheduled:         20 May 2026, 09:00 AM
  📍 Location:          G-13, Islamabad
  💰 Total:             PKR 3,213
  📱 Notifications:     3 channels × 5 messages queued
```

---

> [!NOTE]
> All latency values are representative estimates from local dev environment. Agent traces are logged in real-time to the `/trace` page accessible from any booking confirmation screen.

> [!TIP]
> View live traces during a session by navigating to `/trace` in the ServeIQ app after completing any booking flow.
