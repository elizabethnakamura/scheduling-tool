# The MRC Relationship Radar: Executive Summary

## The Blurb

**The Relationship Radar is an intelligence tool that transforms calendar data into strategic insight.** It continuously scans your executive calendars across divisions (TV, Film, etc.), automatically identifies external relationships by company and project, surfaces relationship concentration risk, flags coverage gaps, and delivers weekly intelligence summaries. It answers the question: *Who at MRC is talking to whom, how often, and what are we missing?*

Think of it as a real-time relationship map that keeps executives from operating in silos.

---

## The Core Problem: Knowledge Sharing & Data Sourcing

**The Challenge:** Relationship intelligence lives in individual calendars, meeting notes, and people's heads. When Scott meets Netflix, does the Film team know? When TV closes a deal with a streamer, does that intelligence reach other executives? When coverage concentrates too heavily on one studio, who flags it?

**The Data Source:** Calendar meetings are the single source of truth—they're timestamped, documented, and universal. But calendars alone are raw data. They need:

1. **Entity recognition** — "Netflix" gets tagged across multiple email domains (netflix.com, netflix-partners.com)
2. **Project association** — "Avatar 2 meetings" tagged to the "Avatar" project for trend analysis
3. **Relationship history** — Building a timeline of frequency, attendee patterns, and outcomes
4. **Manual curation** — Adding context notes (deal status, follow-up actions) that the calendar doesn't capture

**Who uploads the data?**
- **Automatic:** Claude Code reads Outlook calendars weekly and syncs meeting metadata to SQLite database
- **Manual:** Execs or their assistants add meeting notes and follow-up actions via the `sync.py --add-note` CLI command after important calls
- **Continuous:** Domain mappings and entity taxonomy are maintained by someone (likely you) updating the `ENTITIES` list in setup.py when new companies emerge

This hybrid approach ensures zero friction (calendar is automatic) while keeping human judgment in the loop for context and accuracy.

---

## Use Case: The Streamer Concentration Problem

### Scenario

It's Monday morning. Scott and his team meet to allocate Q2 development budget. Without the Radar, they'd ask: *"Who are we talking to?"* The answer is anecdotal—vague references to recent calls and deals in progress.

**With the Relationship Radar:**

**Friday (automated):** Claude runs `sync.py --import-calendar` and pulls all meetings from the past week across MRC TV and MRC Film calendars. The database auto-tags attendees by company (Netflix, Amazon, Apple, etc.) using email domain mappings.

**Sunday 6pm (automated):** The weekly digest script runs. It generates a D3 force-directed network graph showing:
- **Center node:** "MRC TV" group
- **Orbiting entity nodes:** Netflix (large, blue), Amazon (large, blue), Apple TV+ (medium, blue), Peacock (small, blue), HBO (medium, purple), CAA (purple), UTA (purple)
- **Node sizes:** Proportional to meeting count
- **Connections:** Lines show relationship strength

**Below the graph, three red flags appear:**

```
🔴 CONCENTRATION RISK
Netflix accounts for 38% of external meetings this week
Threshold: 25%

🟡 BLIND SPOTS
No contact with Paramount+ in 6 weeks (target: weekly)
No contact with Lionsgate in 4 weeks (target: every 2 weeks)

✅ COVERAGE THIS WEEK
8 external meetings | 6 entities covered
```

**Monday morning:** Scott opens the digest on his dashboard. He immediately sees:
- "We're talking to Netflix too much relative to our pipeline diversification goals"
- "We haven't touched Paramount in 6 weeks—that's a problem"
- "Good: we hit 8 external meetings and covered 6 entities"

**Decision impact:** Scott asks the Film team head why Lionsgate coverage has slipped, and the team discovers they'd deprioritized a relationship that's crucial to an upcoming deal. A single Radar flag prevents a $2M relationship from going cold.

---

## How It Works: The Weekly Digest in Action

### What You See

```
┌─────────────────────────────────────────────────────────────┐
│                    WEEKLY DIGEST TAB                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [This Week] [Last 30 Days] [Last 90 Days]                │
│                                                              │
│              ☆ FORCE-DIRECTED GRAPH ☆                      │
│                                                              │
│                          Netflix ◯ (large, blue)             │
│                        ╱         ╲                           │
│                     ◯─────────────────◯                      │
│                   Amazon           Apple TV+                │
│                   (large, blue)    (medium, blue)           │
│                       │               │                     │
│                   ───────────────────────────               │
│                  ╱                     ╲                    │
│              MRC TV ◯ (center)      CAA ◯ (purple)         │
│                  ╲                     ╱                    │
│                   ───────────────────────────               │
│                       │               │                     │
│                   Peacock          UTA                      │
│              (small, blue)      (medium, purple)           │
│                                                              │
│  ► Hover over nodes to enlarge, click to see details       │
│  ► Drag nodes to rearrange                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ COVERAGE THIS WEEK          CONCENTRATION RISK             │
│ ✅ 8 external meetings      🔴 Netflix: 38%                │
│ ✅ 6 entities covered       (Threshold: 25%)               │
│                                                              │
│ BLIND SPOTS (Silent 2+ weeks)                              │
│ 🟡 Paramount+ (6 weeks)                                     │
│ 🟡 Lionsgate (4 weeks)                                      │
│ 🟢 All other targets: on track                             │
├─────────────────────────────────────────────────────────────┤
│ NETFLIX DETAIL PANEL (on click)                            │
│ ─────────────────────────────                              │
│ Entity: Netflix                                             │
│ Type: Streamer                                              │
│ This Week: 3 meetings                                       │
│ All-Time: 47 meetings                                       │
│ Delta vs Last Week: 📈 +1                                  │
│ MRC Attendees: 8 (Scott, Jessica, Tom, ...)               │
│                                                              │
│ Recent Meetings:                                            │
│ • Apr 1 — 30-min call with Chris & Jessica                │
│ • Mar 30 — 1-hour strategy session (Scott attending)      │
│ • Mar 28 — Product review (Tom attending)                 │
│                                                              │
│ [Close ✕]                                                   │
└─────────────────────────────────────────────────────────────┘
```

### What Happens Behind the Scenes

1. **Calendar import (automatic, weekly):**
   - Claude Code reads Outlook for all external meetings
   - Email domains auto-map to entities (netflix.com → Netflix)
   - Project titles auto-tag to projects (mentions of "Avatar" in calendar title → Avatar project tag)
   - Data syncs to SQLite mrc-radar.db

2. **Digest generation (automatic, Sunday 6pm):**
   - Query: Count meetings per entity (this week, last 30 days, last 90 days)
   - Compute concentration risk: Is any single entity >25% of meetings?
   - Scan blind spots: Compare "days since last meeting" against coverage targets
   - Aggregate attendee counts and relationship trends
   - Export to JSON (entity-map.json, meeting-history.json, weekly-digest.json)

3. **React app consumes JSON:**
   - D3.js renders force-directed network graph
   - Summary cards display metrics and flags
   - Entity detail panel shows historical context
   - Time range toggle updates all visualizations

---

## The Knowledge Sharing Win

Without the Radar:
- ❌ Scott doesn't know TV has 5 Netflix meetings this week while Film has 1
- ❌ The Film team doesn't know TV's Paramount relationship is failing
- ❌ Coverage gaps emerge organically (too late)
- ❌ Individual executives optimize locally, not globally

With the Radar:
- ✅ Scott sees concentration risk in real-time and can rebalance
- ✅ Film team gets alerted to gaps before they become critical
- ✅ Weekly digest becomes standard reading (5 minutes per week)
- ✅ Team-wide visibility = smarter relationship prioritization

---

---

## Personalization: Different Views for Different Roles

The Radar adapts to your role and permissions. Same tool, different intelligence.

### TV Executive View

**What you see:** Calendars from your TV team + shared calendars you have access to.

```
┌─────────────────────────────────────┐
│ GROUP: MRC TV                       │
│ Last updated: Apr 1, 2026           │
├─────────────────────────────────────┤
│                                     │
│    Netflix ◯  Amazon ◯  Apple ◯    │
│       ╲       │       ╱             │
│       ╲       │       ╱              │
│        MRC TV ◯ (center)            │
│       ╱       │       ╲              │
│      ╱        │        ╲             │
│   HBO Max ◯  Peacock ◯  Hulu ◯     │
│                                     │
│ COVERAGE TARGETS:                   │
│ TV-specific: Netflix, Amazon,       │
│ Apple TV+, HBO Max, Peacock, Hulu, │
│ Max Originals, Lifetime, etc.       │
│                                     │
│ [See detailed TV entity list]       │
├─────────────────────────────────────┤
│ All meetings are from TV calendars  │
│ Cross-divisional data: hidden       │
└─────────────────────────────────────┘
```

**You control:** Which team calendars feed into your digest (your direct reports, shared team channels).

---

### Film Executive View

**What you see:** Calendars from your Film team + shared calendars you have access to.

```
┌─────────────────────────────────────┐
│ GROUP: MRC FILM                     │
│ Last updated: Apr 1, 2026           │
├─────────────────────────────────────┤
│                                     │
│  Disney ◯  Universal ◯  Warner ◯   │
│       ╲       │       ╱             │
│       ╲       │       ╱              │
│       MRC FILM ◯ (center)           │
│       ╱       │       ╲              │
│      ╱        │        ╲             │
│   Sony ◯  Paramount ◯  Focus ◯     │
│                                     │
│ COVERAGE TARGETS:                   │
│ Film-specific: Disney, Universal,   │
│ Warner Bros., Sony, Paramount,      │
│ Focus Features, Lionsgate, etc.     │
│                                     │
│ [See detailed Film entity list]     │
├─────────────────────────────────────┤
│ All meetings are from Film calendars│
│ Cross-divisional data: hidden       │
└─────────────────────────────────────┘
```

**You control:** Which team calendars feed into your digest (your direct reports, shared team channels).

---

### CEO/Corporate Executive View

**What you see:** Both TV and Film intelligence + ability to toggle between them or view unified.

```
┌──────────────────────────────────────────────┐
│ GROUP: [All] | [MRC TV] | [MRC FILM]        │
│ Last updated: Apr 1, 2026                    │
├──────────────────────────────────────────────┤
│                                              │
│  UNIFIED VIEW (All meetings):               │
│                                              │
│  Netflix ◯ (size: 8 meetings across TV/Film)
│       ╲                                      │
│     Amazon ◯ (size: 6 meetings)              │
│       ╱  ╲                                   │
│  Disney ◯  ◯ Apple TV+                      │
│             ╲                                │
│    MRC (center) ◯                           │
│           ╱     ╲                            │
│          ╱       ╲                           │
│   Warner ◯     HBO Max ◯                     │
│                                              │
│ WARNINGS:                                    │
│ 🔴 Netflix concentration: 35% (TV: 4, Film: 4)
│ 🟡 Disney: TV strong (5 meetings), Film quiet
│    (1 meeting) — opportunity imbalance      │
│                                              │
├──────────────────────────────────────────────┤
│ DIVISIONAL BREAKDOWN:                        │
│ • Netflix: TV → 4 meetings, Film → 4 meetings
│ • Amazon: TV → 3 meetings, Film → 3 meetings │
│ • Disney: TV → 5 meetings, Film → 1 meeting │
│                                              │
│ [Toggle to TV-only or Film-only view]       │
└──────────────────────────────────────────────┘
```

**You control:** Which divisions' calendars feed in (TV, Film, both), and whether names are shown in cross-divisional summaries.

---

## Privacy & Sharing Controls

**Question: Who sees what?**

The tool respects organizational boundaries and your confidentiality preferences.

### Default Settings (Recommended)

| Scenario | What Happens |
|----------|--------------|
| **TV head views their digest** | See TV team meetings only. Film data is completely hidden. |
| **Film head views their digest** | See Film team meetings only. TV data is completely hidden. |
| **Scott (CEO) views unified digest** | See both TV and Film. Can toggle views. Can see cross-divisional concentration risk. |
| **Individual contributor** | Can see their own meetings + team meetings (if added to team calendar view). Cannot see executive summaries of other teams. |

### Privacy Toggles (You Decide)

When generating your weekly digest, choose:

```
Privacy Settings
────────────────────────────────────

☑ Show entity names in summaries
   (e.g., "Netflix accounts for 35% of meetings")

☐ Show individual attendee names
   (uncheck = show counts only, e.g., "4 executives")

☐ Include cross-divisional comparison data
   (For execs: show when one division dominates an entity)

☐ Share digest via Slack
   (If yes: who has access? All execs? Just your group?)

[Save Settings]
```

### Who Can See What (Access Control)

**You manage it yourself:**
1. **Calendar input:** You select which Outlook calendars feed the database (`--import-calendar` pulls calendars you have permission to access)
2. **Digest generation:** You choose your group (`--digest --group="MRC TV"` generates TV-only)
3. **Slack sharing:** You decide the channel and mention visibility rules

**Enforcement:**
- SQLite database lives on your machine (not shared)
- Weekly digest is a static JSON file you generate
- Slack integration is explicit per-message (you run the command, you post the result)
- No automatic cross-sharing

### Example: Competitive Sensitivity

Scenario: You're in confidential negotiations with Netflix on a Film project. You don't want TV execs to know.

**Solution:**
```
# Don't include confidential meeting in shared digest
python database/sync.py --digest --group="MRC Film" --exclude="Netflix-confidential-project"

# Or generate two digests:
# One for internal Film team (includes Netflix)
# One for exec-wide Slack (excludes confidential meetings)
```

---

## Deployment Model: Who Maintains What

### Option A: Decentralized (Each group owns their copy)

- **TV exec** runs sync.py locally on their machine
  - Pulls TV calendars
  - Generates TV digest
  - Optionally shares to TV Slack channel
- **Film exec** runs sync.py locally on their machine
  - Pulls Film calendars
  - Generates Film digest
  - Optionally shares to Film Slack channel
- **CEO** runs unified sync (pulls both) or reviews both digests

**Pros:** No shared infrastructure, simple privacy, each group controls their data
**Cons:** Multiple databases, manual sync coordination

### Option B: Centralized (One database, role-based access)

- **Central admin** maintains mrc-radar.db on shared server
- **Sync process** imports TV + Film calendars nightly
- **Digest generation** runs Sunday 6pm, produces:
  - `weekly-digest-tv.json` (TV team only)
  - `weekly-digest-film.json` (Film team only)
  - `weekly-digest-unified.json` (execs only)
- **React app** reads based on your role (TV head sees TV digest, CEO sees all)

**Pros:** Single source of truth, easy to compare divisions, automated
**Cons:** Requires shared infrastructure, needs role-based database access control

---

## Next Steps

1. **Decide personalization model:**
   - Option A (decentralized): Each exec runs their own sync.py
   - Option B (centralized): Set up one database + role-based access

2. **Define privacy rules:**
   - Will TV/Film execs ever share cross-divisional data? If so, how?
   - Can CEO see individual attendee names or just counts?
   - Are any meetings confidential/excluded?

3. **Integrate the Weekly Digest tab** into your calendar tool (6-step process in INTEGRATION_INSTRUCTIONS.md)

4. **Set up your first digest:**
   - Run sync.py with your group and privacy settings
   - Review flagged relationships
   - Adjust coverage targets based on your priorities

5. **Slack integration** (optional Phase 2): Auto-post digests to relevant channels (TV-only, Film-only, all-execs)

---

## Technical Specs (Reference)

- **Database:** SQLite (mrc-radar.db), 8 tables, pre-seeded with 82 entities and 44 coverage targets
- **Data flow:** Outlook calendar → sync.py → SQLite → JSON exports → React UI
- **UI:** Single-page app with D3.js force graph, Chart.js summaries, Tailwind styling
- **Update cadence:** Weekly automatic import, Sunday digest generation, manually triggered notes
- **Privacy model:** Role-based filtering in sync.py; you control which calendars/entities are included in each digest
