# CodeCrate - Premium AI Prompt & Workflow Marketplace

**CodeCrate** is a state-of-the-art, production-ready full-stack web application designed as a marketplace for student, developer, and AI enthusiast prompt architectures. Built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **Tailwind CSS**, **Zustand**, and **NextAuth.js**, it incorporates a custom obsidian-themed glassmorphism interface ("Futuristic Developer Forge") and advanced cryptographic asset protection.

This branch introduces a complete **Admin Role System**, **Moderator Control Center**, **Edge Middleware Security Guards**, and robust **Responsive Sign Out Flow**.

---

## 🚀 Key Features

### 🔒 Cryptographic Asset Protection
- **AES-256-CBC Encryption**: All prompt contents are encrypted before writing to the PostgreSQL database, isolating prompts from public view.
- **Secure Vault Decryption Gate**: Purchased prompt contents are decrypted dynamically at request time strictly inside the secure `/api/vault/[id]` gateway after order verification.

### 💼 Triple-Role Command Centers
- **Buyer Workflow**: Browse catalog, filter search queries, manage Zustand carts, checkout mock invoices, and copy purchased templates from their personal digital Vault.
- **Seller Workspace**: Access sales analytics (sales count, invoices registered, net revenues), manage active catalog listings, and publish prompts via verified CRUD forms.
- **Admin Control Terminal**: A premium central moderator node featuring:
  - **Marketplace Analytics**: High-fidelity dashboard widgets compiling total registered users, verified creators, catalog volume, total checkout revenue, and dynamic user growth.
  - **User Management**: Prompts control to promote/demote credentials atomically (Buyer <-> Seller <-> Admin), suspend/unsuspend accounts, and delete records.
  - **Creator Profile Audits**: View profiles, toggle the "Verified Creator" badge, or reject applications (demotes user back to standard buyer).
  - **Asset Moderation**: Quick-filter listing queues by state ("Flagged", "Archived"), toggle prompt visibility parameters, and hard-delete inappropriate uploads.
  - **System Monitor Feed**: Chronological timelines tracking recent registrations, checkout orders, and template uploads.

### 🌐 Navigation & Responsive Sign Out
- **Sleek Desktop Dropdown**: User Profile header toggles a premium glass menu containing identity tags, contextual panels links, and colorful role badges (Buyer = Blue, Seller = Purple, Admin = Amber Gold).
- **Mobile Navigation Drawer**: Responsive hamburger button triggers an elegant slide-over drawer overlay supporting full navigation routes.
- **Zustand-Clearing Sign Out**: Interactive "Sign Out" callbacks atomically terminate NextAuth sessions, purge persistent global Zustand cart stores, and route clients back to `/`.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 14 (App Router, React 18, Server Actions/Route Handlers)
* **Programming Language**: TypeScript
* **Styling**: Tailwind CSS & Glassmorphism Utilities
* **State Management**: Zustand (Global shopping cart store)
* **Database & ORM**: PostgreSQL & Prisma Client (v5.11.0)
* **Authentication**: NextAuth.js (Credentials Provider with Bcrypt password hashing)
* **Security & Cryptography**: AES-256-CBC (Node `crypto` engine), Bcrypt, and Edge-Level Middleware

---

## 📐 Architecture & Security Boundaries

```mermaid
graph TD
    User([Browser Client]) -->|Auth Request| NextAuth[NextAuth Middleware]
    User -->|Explore / Search| Explore[Marketplace Catalog API]
    User -->|Checkout Cart| Checkout[Checkout API Transaction]
    User -->|Decrypt Request| VaultGate[api/vault/:id Route Handler]
    Admin([System Admin]) -->|Admin Commands| AdminAPI[api/admin/* Controllers]

    NextAuth -->|Interceptors Guard /admin & /api/admin| AdminAPI
    Explore -->|Read Listing info where archived = false| DB[(PostgreSQL Database)]
    Checkout -->|Atomic Write Orders| DB
    VaultGate -->|Verify Purchase| DB
    VaultGate -->|Decrypt Cipher| CryptEngine[AES-256 Crypt Engine]
    AdminAPI -->|Moderation Writes| DB
    
    DB -->|Encrypted Blob| VaultGate
    CryptEngine -->|Clear text Prompt| User
    DB -->|General Schema Records| AdminAPI
```

* **Parametrized Inputs**: Full resistance to SQL Injection is natively enforced via Prisma ORM parameterized database interfaces.
* **XSS Defended**: Dynamic inputs are safely escaped in React virtual DOM JSX nodes.
* **Encrypted Payload Isolation**: Raw prompt data is never fetched or returned by standard catalog list queries.
* **Unified Route Guardians**: Standard Next.js `middleware.ts` decodes JWT sessions at the edge to block unauthorized buyers or sellers from entering `/admin` or executing `/api/admin/*` transactions.

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file at the root workspace:

```env
# 1. PostgreSQL connection details
DATABASE_URL="postgresql://username:password@localhost:5432/codecrate?schema=public"

# 2. NextAuth secret (generate a cryptographically strong random token)
NEXTAUTH_SECRET="your-32-character-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# 3. Prompt Cryptographic Encryption key (Must be exactly 32 hex chars / bytes)
PROMPT_ENCRYPTION_KEY="f5e7b8a9d0c1b2a3f5e7b8a9d0c1b2a3"
```

---

## 📦 Local Installation & Setup

Follow these steps to deploy CodeCrate locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database Schema
Instantiate the tables, columns, and custom indices on your PostgreSQL instance:
```bash
npx prisma db push
```

### 3. Seed Mock Catalog Assets & Admin account
Inject seeded categories, hashed profiles, mock creator listings, and **system administrator credentials**:
```bash
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) inside your web browser.

---

## 🔑 Pre-Seeded Verification Accounts

Use the following credentials to audit the role-based navigation shells:

| Identity | Email | Password | Role Badge | Interface Scopes |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@codecrate.com` | `password123` | `ADMIN` (Gold) | Users panel, sellers verify, prompt archives, timeline timelines. |
| **Active Creator**| `alex@codecrate.ai` | `password123` | `SELLER` (Purple) | Seller Panel, listings CRUD templates, secure database writing. |
| **Standard Buyer**| `jane@codecrate.ai` | `password123` | `BUYER` (Blue) | Catalog shopping, vault decryption keys, payment invoice records. |

---

## 🧪 Production Verification & Building

Prior to deploying to production containers, run quality compile checks:

```bash
# 1. TypeScript Validation
npx tsc --noEmit

# 2. Linting Audits
npm run lint

# 3. Production Optimized Bundle Creation
npm run build
```

---

## 🎨 User Interface Mockups & Screenshots

> [!NOTE]
> Below are planned screenshot placeholders for the CodeCrate product lifecycle.

### Landing Page & Catalog Search
![Marketplace Explore Screen Placeholder](/screenshots/explore_catalog.png)

### Seller Commands Dashboard
![Creator Dashboard Analytics & CRUD Placeholder](/screenshots/seller_dashboard.png)

### Secure Vault Key Unlocks
![Vault Delivery Timeline & Prompt Decryption Placeholder](/screenshots/vault_decrypt.png)
