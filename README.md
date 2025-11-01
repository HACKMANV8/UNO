<br/>
<p align="center">
  <h1 align="center">Kriti - The AI Career Agent</h1>
  <p align="center">
    We're not building a better resume. We're building an AI agent to manage your entire career.
    <br />
    <br />
    <img alt="Build Status" src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge">
    <img alt="Project Status" src="https://img.shields.io/badge/status-in%20development-blue?style=for-the-badge">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-purple?style=for-the-badge">
  </p>
</p>

## The Problem: The "Brutal Truth"

The traditional career ecosystem is broken. It's built on guesswork, friction, and misplaced trust, and students pay the highest price.

* **Students are Lost:** They have no data-driven way to know if their degree will lead to a job, what skills *actually* matter, or how to bridge the gap from "Campus to Corporate."
* **Students are Overwhelmed:** Job hunting is a 24/7, soul-crushing job. They manually apply to 100+ positions for 2-3 interviews, all while being treated as "guilty until proven innocent" by verification processes.
* **DigiLocker is a Filing Cabinet:** Existing tools are passive vaults. They are where documents go to sleep. They do not hold professional experience, project work, or skills, and they *absolutely* do not use AI to read those documents and get you a job.

## The Solution: A "Student-First" AI Agent

We are not building another B2B verification network. That's a "cold-start" paradox destined to fail.

We are building a **student-first "Trojan Horse."** Our mission is to acquire millions of students by offering overwhelming, immediate, and free value. We solve their real problems (being lost and overwhelmed) *first*. The "verification network" is the endgame we build with the massive, engaged user base we've already captured.

---

## Product Roadmap & Core Features

### Phase 1: The Hook (Acquisition - 100% Free)

The goal is to solve a user's biggest problems in 5 minutes with zero friction.

* **AI Resume Builder:** A student enters their (unverified) details. Instantly, our AI refactors it into 10+ professional, ATS-optimized templates.
* **AI Interview Prep:** Our AI reads their unverified profile and instantly generates a custom mock interview to prepare them.
* **Job Scout (Basic):** Our `n8n` automation scrapes public job boards and shows them matching jobs directly in their dashboard.

### Phase 2: The "Verified GPS" (Retention & The Pivot to Trust)

Now that the user is hooked, we show them the real power of Kriti.

* **AI Career GPS:** The user sets a goal: "AI Engineer @ Google."
* **Data-Driven "Quest Log":** Our AI analyzes the anonymized, aggregated, **VERIFIED** career paths of thousands of other users on our platform. It returns a "quest log":
    > "Path Not Found. Your [B.Tech CS] alone has a <1% probability of success.
    > **Highest-Probability Path Unlocked:**
    > 1.  **Critical Skill Gap:** You are missing a [Verified Skill: PyTorch]. (Users with this VC see a 40% salary increase).
    > 2.  **Critical Skill Gap:** You are missing a [Verified Skill: AWS Certified ML].
    > 3.  **Path:** Get Skill VC (PyTorch) -> Get Skill VC (AWS ML) -> Get [Verified 2-Year Experience VC]..."
* **Result:** The user now has a powerful, selfish incentive to get their credentials verified, turning them into evangelists who demand Verifiable Credentials (VCs) from their issuers.

### Phase 3: The "AI Agent" (Monetization - Kriti PRO)

This is the "do or die" feature: the autonomous, 24/7 career agent.

* **Set & Forget:** The user subscribes and activates their agent.
* **Parameters:** *"Find me a Remote AI/ML job > ₹12 LPA. Handle all applications and first-round screenings. Wake me up for the final (human) interview."*
* **Autonomous Action:** The agent uses our n8n Job Scout, "Smart Autofill" to apply, and its "Digital Twin" (an AI chatbot) to complete initial screening interviews on the user's behalf.

---

## 🛠️ Technical Architecture & Tech Stack

Our architecture is a **Web-Only, Centralized-Encrypted** model designed for zero friction and zero-knowledge data security.

| Component | Technology | Role (The "Why") |
| :--- | :--- | :--- |
| **Frontend** | `React` / `Next.js` | **The "Cockpit":** The student dashboard, AI tools, and admin portals. |
| **Backend & DB** | `Firebase` (Auth/Firestore) | **The "Vault":** A secure, zero-knowledge, E2E encrypted user data store. |
| **Automation** | `n8n` | **The "Scout":** 24/7 workflow scraping job boards and feeding the AI. |
| **AI / ML** | `PyTorch` / `TensorFlow` / `LLMs` | **The "Brain":** Powers the Resume Builder, Interview Prep, Career GPS, & AI Agent. |
| **Trust Anchor** | `Polygon` (Amoy Testnet) | **The "Public Phonebook":** An immutable `DidRegistry.sol` smart contract. |
| **Agent Tools** | `Chrome Extension` | **The "Hand":** Enables "Smart Autofill" and autonomous agent actions. |

### How Blockchain is Used (The Trust Anchor)

The blockchain is our **Trust Anchor**, not our storage. It is an immutable "public phonebook."

1.  **Storage:** Our `DidRegistry.sol` smart contract (on Polygon) stores only the **Public Keys** of verified Issuers (e.g., VTU, Infosys).
2.  **Verification:** When a recruiter needs to verify a student's VC (which is stored, encrypted, in Firebase), the logic is simple:
    * The VC is cryptographically signed by the Issuer.
    * Our system checks that signature against the Issuer's Public Key stored on the blockchain.
    * This proves the data is authentic and untampered, **even if our entire Firebase database is breached.**

### How AI is Used (The Brain)

AI is the core B2C value proposition.

* **AI Resume Builder:** (The Hook)
* **AI Interview Prep:** (The Hook)
* **AI Career GPS:** (The "Do or Die" Feature) Analyzes aggregated, verified data to create predictive career "quest logs."
* **AI Agent/Digital Twin:** (The "PRO" Feature) Autonomously applies for jobs and handles screenings.

### Security & Data Model: Zero-Knowledge Host

This is non-negotiable.

* **Platform:** A React/Next.js Web Portal and a Chrome Extension. No native app to reduce friction.
* **Storage:** We use a **Centralized-Encrypted Store (Firebase)**.
* **Encryption:** All VCs and private data are **end-to-end encrypted client-side** (in the browser) using a key derived from the user's password.
* **Result:** We, as Kriti, cannot read the user's private data. We are a "zero-knowledge" host.

---

## Business Model (B2C-First)

1.  **Acquisition (FREE):** All "hook" features (AI Resume Builder, AI Interview Prep, Manual Job Search) are 100% free to acquire millions of users.
2.  **Monetization (B2C "Kriti PRO"):** A monthly/annual subscription that unlocks the **AI Career GPS** and the **Autonomous AI Agent**. This is our primary revenue stream.
3.  **Monetization (B2B "Kriti for Recruiters"):** A secondary, long-term revenue stream. Once we have millions of verified students, companies will pay for access to our "Smart Filter" and "Kriti-Gauntlet" (AI skills tests) because it's 10,000x faster than traditional BGV.

---

## Getting Started

*(This section is a placeholder for when the project is public)*

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or higher)
* Yarn or npm
* A Firebase project
* An `n8n` instance

### Installation

1.  Clone the repo
    ```sh
    git clone [https://github.com/your_username/kriti-ai-agent.git](https://github.com/your_username/kriti-ai-agent.git)
    ```
2.  Install NPM packages
    ```sh
    cd kriti-ai-agent
    npm install
    ```
3.  Set up your environment variables in `.env.local`
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    # ...other keys
    ```
4.  Run the development server
    ```sh
    npm run dev
    ```

## Contribers
##1. Darshil Nathwani
##2. Aadya Baranwal
##3. Dhruva K R
##4. Utsav Patel
