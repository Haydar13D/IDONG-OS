# IDONG OS Implementation Roadmap
**Version:** 1.0  
**Role:** Engineering Manager  
**Project Phase:** Planning & Delivery  

This document defines the phases, milestones, dependencies, and deliverables for implementing **IDONG OS**. The roadmap is structured to ensure that every milestone produces a functional, independently testable result within a **2–4 day** execution window.

---

## Global Definition of Done (DoD)
To mark any milestone as "Done," it must meet the following baseline criteria:
*   **Compile & Build:** The codebase compiles with zero TypeScript errors under strict mode (`noImplicitAny` enabled).
*   **Database Integrity:** Schema modifications are managed via Prisma migrations (`prisma migrate dev`). Direct schema pushes are disallowed.
*   **Code Style:** Adheres to naming conventions (camelCase for methods/variables, PascalCase for components, UPPER_SNAKE_CASE for config env variables).
*   **Testing:** New logical engines (streaks, score calculations) include unit tests (Vitest). UI modules include integration tests or manual validation logs.
*   **UI Quality:** Dark mode styled with custom Outfit and Geist Mono fonts, keeping border treatments to 1px solid and rounded corners to 6px.
*   **Audit Logging:** Target events trigger audit logs in the system (`created goal`, `deleted task`, `finished weekly contract`, `reset streak`).

---

## Phase 1: Project Scaffolding & Core Infrastructure
**Estimated Phase Effort:** 6 Days

```
[Milestone 1.1: Next.js & Prisma Scaffolding]
       │
       ▼
[Milestone 1.2: Authentication & AppConfig]
```

### Milestone 1.1: Next.js App & Prisma SQLite Setup
*   **Estimated Effort:** 3 Days
*   **Dependencies:** None.
*   **Deliverables:**
    *   Next.js 14+ scaffolded workspace utilizing TypeScript and App Router.
    *   Prisma schema initialized with SQLite configuration.
    *   UI theme styles (fonts Outfit/Geist Mono, base Tailwind configs, color variables).
*   **Independently Testable Verification:**
    *   Local Next.js dev server starts successfully.
    *   `/` path renders a placeholder landing page matching the Vercel/Linear dark aesthetic.
    *   `npx prisma migrate dev` creates a working SQLite DB (`prisma/dev.db`) containing initial tables.

### Milestone 1.2: Passcode Authentication & AppConfig Module
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 1.1
*   **Deliverables:**
    *   HTTP-only, secure, SameSite=Strict cookie session authentication.
    *   Single-user Pin-Entry Login view (`/login`) validating against `process.env.APP_PASSWORD`.
    *   Database-backed `AppConfig` model CRUD endpoints.
    *   Settings view `/settings` allowing toggles for Theme ("light" | "dark"), Timezone (default: GMT+7), Daily Reminder time ("08:00"), Weekly Reminder time ("08:00"), and Dashboard Layout ("2-column" | "3-column").
*   **Independently Testable Verification:**
    *   Attempting to load `/dashboard` without authentication redirects immediately to `/login`.
    *   Entering the correct PIN creates a 30-day secure cookie session and grants access.
    *   Modifying layout settings in `/settings` updates the database state immediately.

---

## Phase 2: Accountability Core & Dashboard UI
**Estimated Phase Effort:** 8 Days

```
[Milestone 1.2]
       │
       ▼
[Milestone 2.1: Daily Standups & Streak Engine]
       │
       ▼
[Milestone 2.2: Weekly Contracts & Review]
       │
       ▼
[Milestone 2.3: Central Dashboard Overview]
```

### Milestone 2.1: Daily Standups & Streak Engine
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 1.2
*   **Deliverables:**
    *   Standup input form page (`/daily-log`) validating three daily standup fields.
    *   Core Streak logic service tracking current streak, longest streak, and last streak reset date.
    *   "Red Flag" logic that marks `redFlagStatus` in configuration as true if 3 consecutive days pass without a standup.
*   **Independently Testable Verification:**
    *   Standup log entry can be submitted, restricting submissions to one per day (using UTC+7 boundaries).
    *   Unit tests prove streak increments on sequential submissions containing artifact links.
    *   Unit tests verify streak resets to 0 and `redFlagStatus` switches to true if simulated history spans 3 days without logs. Audit log entries are saved on streak reset.

### Milestone 2.2: Weekly Contracts & Reviews
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 2.1
*   **Deliverables:**
    *   Weekly Contract creation page (`/weekly-contract`) allowing the user to input exactly three commitment items for the current week.
    *   Weekly Review module assessing commitments against actual achievements, computing a score (0.0 to 1.0).
    *   Audit Logging functionality writing database records for specific actions: `finished weekly contract` and `reset streak`.
*   **Independently Testable Verification:**
    *   Submitting commitments writes a `WeeklyContract` record in status "ACTIVE".
    *   Reviewing the contract computes scores correctly (e.g. 2 out of 3 met = score 0.67) and logs a `finished weekly contract` entry in the audit database.

### Milestone 2.3: Central Dashboard Grid UI
*   **Estimated Effort:** 2 Days
*   **Dependencies:** Milestone 2.2
*   **Deliverables:**
    *   Responsive dashboard landing layout `/dashboard` that respects the active `AppConfig` (toggling dynamic 2-column or 3-column structures).
    *   Widgets displaying streak count, active red flag notifications, weekly contract tasks, and a timeline history.
*   **Independently Testable Verification:**
    *   Dashboard updates layout instantly when modifying the grid format in settings.
    *   Visual representation displays a warning banner if `redFlagStatus` is active.

---

## Phase 3: Division-Specific Modules
**Estimated Phase Effort:** 8 Days

```
                [Milestone 2.3]
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
  [Milestone 3.1] [Milestone 3.2] [Milestone 3.3]
```

### Milestone 3.1: Skripsi & Research Module
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 2.3
*   **Deliverables:**
    *   Thesis Decision Matrix form: dynamically calculates weighted scores based on inputs (Speed, Relevance, Portfolio Value, Risk).
    *   Skripsi Milestone Checklist component: tracking chapters 1-5, defense preparations, and supervisor review notes.
    *   Audit Logger integration hook for `created goal` and `deleted task`.
*   **Independently Testable Verification:**
    *   Decision matrix correctly highlights recommended projects using PRD math weights.
    *   Confirming a final thesis choice saves the selection in `DecisionRecord` and sets it as the active skripsi goal.
    *   Completing/deleting thesis subtasks records `created goal` and `deleted task` logs in the audit database.

### Milestone 3.2: Job Readiness Kanban & Certification Progress
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 2.3
*   **Deliverables:**
    *   Interactive Kanban board (`/job-readiness`) showing job pipelines (Wishlist, Applied, Interview, Offer, Rejected).
    *   Certification component tracking certification goals using `completedTask` and `totalTask` fields.
    *   Interview preparation question database module (Q&A bank).
*   **Independently Testable Verification:**
    *   Moving applications across states writes status updates successfully to SQLite database.
    *   Creating certifications tracks progress mathematically as `completedTask / totalTask`. Entering 2 completed out of 4 tasks correctly calculates progress as 50%.

### Milestone 3.3: Skill Building & Personal/Org Widgets
*   **Estimated Effort:** 2 Days
*   **Dependencies:** Milestone 2.3
*   **Deliverables:**
    *   Homelab technical task checklist tracker integrated with subtask metrics.
    *   IMM/Personal schedule widgets displaying upcoming engagements to flag potential schedule collisions.
*   **Independently Testable Verification:**
    *   Toggling granular homelab checklist items (e.g. "Deploy nginx in k3s cluster") recalculates the parent Skill goal progress immediately.

---

## Phase 4: Cron Daemons, Alerts & Deployment
**Estimated Phase Effort:** 6 Days

```
[Milestones 3.1, 3.2, 3.3]
           │
           ▼
[Milestone 4.1: Telegram Daemon Worker]
           │
           ▼
[Milestone 4.2: Dockerization & Tailscale]
```

### Milestone 4.1: Telegram Bot Daemon Worker
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 2.2, Milestone 3.1, Milestone 3.2
*   **Deliverables:**
    *   Separated node process located under `worker/` containing matching database configuration files.
    *   Cron configuration running a nightly task checking if the user logged their standup.
    *   Telegram Bot connection routing Daily Standup reminder alerts (configurable at 08:00 or other AppConfig times) and warnings if a "Red Flag" is active.
*   **Independently Testable Verification:**
    *   Running the worker CLI with mocked data successfully triggers Telegram notifications.
    *   Standup warning checks occur strictly on time using the user's GMT+7 configurations.

### Milestone 4.2: Containerization & Secure Network Deploy
*   **Estimated Effort:** 3 Days
*   **Dependencies:** Milestone 4.1
*   **Deliverables:**
    *   `Dockerfile` configured for Next.js production builds.
    *   `docker-compose.yml` linking Next.js container and Telegram Bot worker.
    *   Host cron script automating database backup routines (nightly backup targeting persistent SQLite `.db` exports).
    *   Tailscale serve instructions mapping internal ports securely.
*   **Independently Testable Verification:**
    *   Running `docker compose up -d` boots both Next.js app and the Telegram cron worker.
    *   Accessing the application from a Tailscale-connected client redirects via HTTPS using `tailscale serve`.
    *   Simulated DB backup task successfully outputs a valid SQLite backup file to target directory.
