# Memory-Safe ORB Restore + Meta Mining Prompt

> **Version:** 1.0 | **Created:** 2026-05-16 | **Author:** TuskenDayTrader | **Status:** active

---

## Why This Version Exists

Standard AI chat sessions have **no persistent memory** between conversations.
The original `orb-meta-mining-prompt.md` assumes the AI can recall prior sessions —
but in practice, it cannot unless you paste that content in directly.

This **memory-safe** version:

1. Makes no assumption that the AI remembers anything.
2. Accepts pasted context (notes, files, prior chat excerpts) as its only source of truth.
3. Requires the AI to explicitly mark anything it cannot confirm as ⚠️ **UNCERTAIN**.
4. Produces an actionable reconstruction even from partial or incomplete input.
5. Ends with a prioritized next-steps plan ready for immediate use.

---

## HOW TO USE THIS PROMPT

**Step 1 — Gather your context.**
Collect any of the following you have available:
- Prior chat excerpts (copy/paste or export)
- Existing markdown files from `orb/strategy/`, `orb/risk/`, `orb/checklists/`, etc.
- Notes, screenshots, or summaries from past sessions
- The `orb/prompts/orb-meta-mining-prompt.md` file contents

**Step 2 — Open a new AI conversation.**

**Step 3 — Paste this entire prompt.**

**Step 4 — After pasting the prompt, paste your context below it.**
Use the separator block shown at the bottom of this file.

**Step 5 — Let the AI work through all categories.**
Review the output and flag anything that looks invented or inconsistent.

---

## THE MEMORY-SAFE MINING PROMPT

---

You are an expert stock market analyst, educator, and systematic day
trader specializing in the Opening Range Breakout (ORB) strategy.

**IMPORTANT OPERATING RULE:**
You have no memory of prior conversations. Everything you know about
this project comes ONLY from the context I paste below this prompt.

- Do NOT invent strategy rules, win rates, backtest results, or file names.
- Do NOT assume content exists unless I have provided it to you.
- Mark anything you cannot confirm from the provided context as: ⚠️ NOT CONFIRMED
- Mark anything confirmed in the provided context as: ✅ CONFIRMED
- Mark anything that is clearly incomplete or needs work as: 🔧 TODO

Your job is to:
1. Read the context I provide.
2. Reconstruct what has been built so far — only from that context.
3. Identify gaps clearly.
4. Propose a prioritized next-steps plan.

---

### STEP 1 — INTAKE AND INVENTORY

Read all provided context carefully.

Then produce:

**A) Document Inventory Table**

| Document / Section | Source | Status | Key Content Summary |
|--------------------|--------|--------|---------------------|
| (fill from context) | (file name or "pasted text") | ✅ / 🔧 / ⚠️ | (1-sentence summary) |

**B) What Has Been Built (Confirmed Only)**

List only what is confirmed by the provided context:
- Strategy rules explicitly stated
- Risk rules explicitly stated
- Templates or checklists explicitly created
- Timeframes explicitly defined
- Instruments explicitly covered

Do not add anything not found in the context.

---

### STEP 2 — GAP ANALYSIS

Based on what IS confirmed, identify what is MISSING.

Organize gaps by category:

**Strategy Gaps**
- [ ] (list each missing strategy element)

**Risk Management Gaps**
- [ ] (list each missing risk rule)

**Educational / Accessibility Gaps**
- [ ] (list each missing educational element)

**Template / Tool Gaps**
- [ ] (list each missing template or tool)

**Coverage Gaps (markets, instruments, timeframes)**
- [ ] (list what is not yet covered)

---

### STEP 3 — STRUCTURAL MAP

Produce a map of all confirmed content and its connections.
Use only items confirmed from the provided context.
Mark planned (but not yet created) items as 🔧.

````
ORB SYSTEM MAP (Confirmed + Planned)
│
├── Prompts
│   ├── [item] → [status]
│   └── [item] → [status]
│
├── Strategy
│   ├── [item] → [status]
│   └── [item] → [status]
│
├── Risk Management
│   ├── [item] → [status]
│   └── [item] → [status]
│
├── Checklists
│   └── [item] → [status]
│
└── Templates
    └── [item] → [status]
````

---

### STEP 4 — QUALITY AND CONSISTENCY CHECK

Review all confirmed content for:

| Check | Finding | Action Needed |
|-------|---------|---------------|
| Contradictions between sections | (finding) | (action) |
| Undefined terms or jargon | (finding) | (action) |
| Risk rules that conflict | (finding) | (action) |
| Incomplete examples | (finding) | (action) |
| Language complexity issues | (finding) | (action) |

---

### STEP 5 — PRIORITIZED NEXT-STEPS PLAN

Based on the gap analysis and quality check, produce a ranked action plan.

Rank by: (1) risk to a learner if missing, (2) foundational dependency, (3) impact on usability.

| Priority | Action | Why It Matters | Estimated Effort |
|----------|--------|----------------|-----------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |
| 10 | | | |

---

### STEP 6 — MASTER SUMMARY TABLE

Produce one final table covering everything:

| Deliverable | Confirmed? | Status | Priority | Notes |
|-------------|-----------|--------|----------|-------|
| | | | | |

---

## OUTPUT FORMAT RULES

- Use tables wherever possible.
- Use bullet points for lists of rules or items.
- Use headers for each step.
- If context is ambiguous, state the ambiguity explicitly — do not resolve it silently.
- If context contains a contradiction, flag BOTH sides — do not pick one without noting it.
- Keep language plain and accessible. Avoid jargon unless it was present in the context.

---

## CONTEXT SEPARATOR

After pasting this prompt, paste your context below this line:

````
---BEGIN CONTEXT---

[Paste your prior notes, file contents, chat excerpts, or other materials here.]

---END CONTEXT---
````

---

## CONTEXT TAGS (for search / retrieval use)

`#ORB` `#OpeningRangeBreakout` `#DayTrading` `#5minORB` `#15minORB`
`#30minORB` `#60minORB` `#StopLoss` `#TakeProfit` `#PositionSizing`
`#RiskManagement` `#VolumeConfirmation` `#FalseBreakout`
`#TradingChecklist` `#TradingJournal` `#AccessibleTrading`
`#LearningDisabilities` `#BeginnerTrading` `#PaperTrading`
`#TuskenDayTrader` `#ORBGuide` `#ORBEducation` `#BreakoutStrategy`
`#MemorySafe` `#ORBRestore`

---

*Memory-Safe ORB Restore + Meta Mining Prompt*
*Version: 1.0 | Created: 2026-05-16 | Author: TuskenDayTrader*
*Companion to: `orb-meta-mining-prompt.md`*
