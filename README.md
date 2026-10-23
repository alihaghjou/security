# SecureFlow — Intelligent Cybersecurity Platform

> **"Your security, managed intelligently."**  
> *From security alerts to security confidence.*

SecureFlow transforms cybersecurity from a chaotic stream of technical alerts into calm, transparent reassurance. Built on modern Next.js 16, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL, SecureFlow delivers three distinct, cohesive experiences backed by a single multi-tenant security architecture:

1. **Everyday User** — Mobile-first, jargon-free security status, one-tap threat verification ("Was this you?"), verified technician identity, and direct support chat.
2. **Security Technician** — Desktop-first SOC investigation workspace, skill-based incident routing, SLA acknowledgment clocks, raw forensic telemetry, runbooks, and AI diagnostic briefs.
3. **Organization Administrator** — Central command console, SLA adherence metrics, team workload meters, multi-tenant boundaries, automated escalation policies, and immutable audit logs.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- PostgreSQL 16+ running locally on port `5432`
- `pnpm` (v10+)

### 1. Environment Setup
```bash
cp .env.example .env
# Ensure DATABASE_URL matches your local PostgreSQL configuration:
# DATABASE_URL="postgresql://<user>@localhost:5432/secureflow?schema=public"
```

### 2. Database Sync & Seed
```bash
# Push Prisma schema to PostgreSQL
pnpm run db:push

# Seed with all 5 interactive scenarios and demo users
pnpm run db:seed
```

### 3. Start the Platform
```bash
# Production mode:
pnpm run build
pnpm run start -p 3000

# Or Development mode:
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts & Instant Role Switcher

SecureFlow includes a top banner with an **Instant Role Switcher** and **Demo Scenario Launcher** on every page, allowing immediate exploration:

| Role | Email | Password | Primary Experience |
|---|---|---|---|
| **Everyday User** | `sarah@acme-corp.demo` | `demo-password` | [`/dashboard`](http://localhost:3000/dashboard) |
| **Security Technician** | `alex@secureflow.demo` | `demo-password` | [`/technician`](http://localhost:3000/technician) |
| **Org Administrator** | `jordan@acme-corp.demo` | `demo-password` | [`/admin`](http://localhost:3000/admin) |
| **MSSP Provider** | `taylor@secureflow.demo` | `demo-password` | Multi-tenant tenant switcher |

---

## 🧪 5 Interactive Demo Scenarios

You can trigger and test all five scenarios via the top **"Launch Demo Scenarios"** menu in the application bar or via the REST API:

### Scenario 1: Suspicious Login Verification
- **What happens:** An anomalous geo-velocity sign-in attempt from Tokyo (`133.242.18.91`) arrives.
- **Workflow:** The routing engine matches the `IDENTITY` category, assigns Identity Specialist Alex Chen, and requests user verification.
- **Interaction:** The user sees a clear card: *"Was this you?"* with one-tap actions (*"Yes, it was me"* / *"No, protect my account"*).
- **Outcome:** Confirming legitimacy immediately resolves the alert; denying flags compromise and escalates investigation.

### Scenario 2: Endpoint Malware Quarantine
- **What happens:** An EDR signal quarantines a cryptominer binary on workstation `WKSTN-DEV-12`.
- **Workflow:** Assigned to Endpoint Specialist Alex Chen.
- **Interaction:** Technician reviews the SHA-256 hash, process tree, and executes containment.
- **Outcome:** Technician verifies clean removal and resolves the case with documented post-mortem steps.

### Scenario 3: Missed Acknowledgment SLA Auto-Escalation
- **What happens:** A critical alert is assigned to a technician who misses the 15-minute acknowledgment window.
- **Workflow:** The SLA Escalation Engine detects the breach, logs an audit record, and auto-routes to on-call backup Elena Rostova without creating recursive notification loops.

### Scenario 4: Telemetry Correlation & Duplicate Grouping
- **What happens:** Multiple rapid brute-force network events arrive from the same perimeter subnet.
- **Workflow:** The correlation engine groups repeated telemetry into a single active case within a 15-minute sliding window. Original evidence is preserved without flooding users or technicians.

### Scenario 5: Verified Incident Resolution
- **What happens:** Technician documents verified remediation, root-cause analysis, and preventive measures.
- **Workflow:** Incident status transitions to `RESOLVED`, audit log records the verification timestamp, and the user receives a peace-of-mind resolution summary.

---

## 🔒 Security Architecture & OWASP Alignment

- **Tenant Isolation:** Every database query enforces strict `organizationId` boundaries.
- **Signed Webhooks:** HMAC-SHA256 signature verification (`x-secureflow-signature`) with a 5-minute replay protection window (`x-secureflow-timestamp`).
- **AI Safety & Copilot Guardrails:** AI summaries are strictly grounded in authorized incident data with visible uncertainty indicators. AI is never allowed to execute destructive or containment actions autonomously.
- **Anti-Impersonation:** Technicians carry a cryptographically verified specialist badge. The platform actively forbids asking users for passwords or 2FA codes.
- **Immutable Audit Ledger:** All status transitions, escalations, and administrative modifications are persisted to an append-only audit log.

---

## 🧪 Automated Testing
Run the comprehensive end-to-end verification suite:
```bash
pnpm test
```
*Executes 25 automated tests covering all 17 UI views, 5 REST endpoints, and all 5 demo scenarios.*
