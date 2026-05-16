# ORB Strategy Collection

> **Version:** 1.0 | **Created:** 2026-05-16 | **Maintainer:** [@TuskenDayTrader](https://github.com/TuskenDayTrader)

A dedicated home for all **Opening Range Breakout (ORB)** strategy documentation,
prompts, templates, and meta-tools inside the ORBZ repository.

---

## What is the Opening Range Breakout (ORB)?

The **Opening Range Breakout** is a day-trading strategy built on a single,
observable fact: the first N minutes of a trading session (the "opening range")
tend to attract the highest volume and volatility of the day.

When price breaks decisively above or below the high/low formed in that opening
window — supported by volume and confirmed by context — it often signals a
tradeable directional move for the remainder of the session.

Common opening-range windows used by traders:

| Timeframe | ORB Period | Common Market |
|-----------|-----------|---------------|
| 5-minute  | First 5 min of RTH | Equities, Index Futures |
| 15-minute | First 15 min of RTH | Equities, Index Futures |
| 30-minute | First 30 min of RTH | Equities, Futures, ETFs |
| 60-minute | First 60 min of RTH (IB) | Futures (YM, ES, NQ, CL) |

> **RTH** = Regular Trading Hours. For U.S. markets: 9:30 AM – 4:00 PM ET.
> All times in this collection are **ET (Eastern Time)** unless noted.

---

## What Is in This Collection

This folder is the canonical home for ORB **strategy development** content.
It is distinct from the operational session-extraction work in `sessions/`.

```
orb/
├── README.md                                     ← you are here
├── prompts/
│   ├── orb-meta-mining-prompt.md                 ← master cross-session retrieval prompt
│   └── orb-restore-mining-prompt-memory-safe.md  ← memory-safe improved version
├── strategy/
│   ├── README.md                                 ← strategy index (placeholder)
│   └── orb-strategy-spec-template.md             ← blank template for strategy specs
├── risk/
│   └── README.md                                 ← risk / position-sizing index (placeholder)
├── checklists/
│   └── README.md                                 ← daily checklist index (placeholder)
└── templates/
    ├── README.md                                  ← template index (placeholder)
    └── trading-journal-template.md                ← blank trading journal
```

---

## How to Use the Prompts

The `prompts/` folder contains **AI conversation prompts** designed to help you
reconstruct and continue prior ORB strategy work across chat sessions.

### orb-meta-mining-prompt.md
Use this at the **start of a new conversation** to retrieve all prior ORB work
across sessions. It instructs the AI to surface files created, strategy rules
established, gaps, and open items — organized by category.

### orb-restore-mining-prompt-memory-safe.md
An improved version of the mining prompt that:
- Works even when the AI has **no memory** of prior sessions
- Accepts pasted context blocks directly
- Adds explicit uncertainty markers so the AI doesn't invent data
- Organizes output into a prioritized action plan

**Workflow:**

1. Open a new chat with your preferred AI assistant.
2. Copy the full contents of either prompt file.
3. Paste it into the chat.
4. Follow any additional instructions inside the prompt (e.g., paste in prior notes).

---

## How to Contribute / Update Versioning

| Action | Convention |
|--------|-----------|
| Add a new strategy rule | Update `strategy/` files; add version bump to file header |
| Add a new prompt version | Create a new file (e.g. `orb-meta-mining-prompt-v2.md`); don't overwrite v1 |
| Fill a placeholder | Remove the TODO block, add real content, bump the version header |
| Add a new section | Update this README's structure map to reflect it |
| Record a confirmed session | Use `sessions/YYYY-MM-DD-YM/` (see root README) |

Version headers in all files follow this format:

```
> **Version:** X.Y | **Updated:** YYYY-MM-DD | **Status:** draft / active / superseded
```

---

## Current Status

| Section | Status | Notes |
|---------|--------|-------|
| `prompts/` | ✅ v1.0 complete | Two prompts: original + memory-safe |
| `strategy/` | 🔧 placeholder | No strategy rules written yet |
| `risk/` | 🔧 placeholder | No risk framework written yet |
| `checklists/` | 🔧 placeholder | No checklist written yet |
| `templates/` | 🔧 placeholder | Journal template scaffolded; not filled |

---

## Conventions

- **No invented data.** If we don't have it, it's a TODO.
- **Missing fields** are written as `(not yet defined)` — never filled with guesses.
- **Version headers** on every file.
- **Plain language** throughout. Aim for readability at a general audience level.
- **EST / ET** for all times unless a specific instrument's session requires otherwise.
