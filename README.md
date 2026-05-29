# CodeCrate - Premium AI Prompt & Workflow Marketplace

**CodeCrate** is a state-of-the-art, production-ready full-stack web application designed as a marketplace for student, developer, and AI enthusiast prompt architectures. Built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **Tailwind CSS**, **Zustand**, and **NextAuth.js**, it incorporates a custom obsidian-themed glassmorphism interface ("Futuristic Developer Forge") and advanced cryptographic asset protection.

---

## 🚀 Key Features

### 🔒 Cryptographic Asset Protection
- **AES-256-CBC Encryption**: All prompt contents are encrypted before writing to the PostgreSQL database, isolating prompts from public view.
- **Secure Vault Decryption Gate**: Purchased prompt contents are decrypted dynamically at request time strictly inside the secure `/api/vault/[id]` gateway after order verification.

### 💼 Dual-Role Command Center
- **Buyer Workflow**: Browse catalog, filters search queries, manages Zustand carts, mock invoicing checkouts, and copy purchased templates from their personal digital Vault.
- **Seller Workspace**: Access simplified sales analytics (sales count, invoices registered, net revenues), manage active catalog listings, and publish prompts via verified CRUD forms.
- **Creator Enrollment**: Easily transition from BUYER to SELLER atomically in a single database transaction, updating NextAuth active sessions dynamically.

### 🌐 Marketplace & Discovery
- **Server-Side Filters**: Custom query limiters based on SQL keywords, AI model engine types, category slugs, and price ceilings.
- **High-Fidelity UI**: Obsidian design base (`#000000`), glassmorphic panels, glowing neon boundary borders, responsive navigation menus, and delivery timeline trackers.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 14 (App Router, React 18, Server Actions/Route Handlers)
* **Programming Language**: TypeScript
* **Styling**: Tailwind CSS & Glassmorphism Utilities
* **State Management**: Zustand (Global shopping cart store)
* **Database & ORM**: PostgreSQL & Prisma Client (v5.11.0)
* **Authentication**: NextAuth.js (Credentials Provider with Bcrypt password hashing)
* **Security & Cryptography**: AES-256-CBC (Node `crypto` engine) & Bcrypt

---

## 📐 Architecture & Security Boundaries

```mermaid
graph TD
    User([Browser Client]) -->|Auth Request| NextAuth[NextAuth Middleware]
    User -->|Queries| Explore[Marketplace Catalog API]
    User -->|Checkout| Checkout[Checkout API Transaction]
    User -->|Decrypt Request| VaultGate[api/vault/:id Route Handler]

    Explore -->|Read Listing info| DB[(PostgreSQL Database)]
    Checkout -->|Atomic Write Orders| DB
    VaultGate -->|Verify Purchase| DB
    VaultGate -->|Decrypt Cipher| CryptEngine[AES-256 Crypt Engine]
    
    DB -->|Encrypted Blob| VaultGate
    CryptEngine -->|Clear text Prompt| User
```

* **Parametrized Inputs**: Full resistance to SQL Injection is natively enforced via Prisma ORM parameterized database interfaces.
* **XSS Defended**: Dynamic inputs are safely escaped in React virtual DOM JSX nodes.
* **Encrypted Payload Isolation**: Raw prompt data is never fetched or returned by standard catalog list queries.

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
Instantiate the tables and apply relations to your PostgreSQL instance:
```bash
npx prisma db push
```

### 3. Seed Mock Catalog Assets
Inject seeded categories, hashed profiles, mock creator listings, and encrypted templates:
```bash
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) inside your web browser.

---

## 🧪 Production Verification & Building

Prior to deploying to production containers, run quality compile checks:

```bash
# 1. TypeScript Validation
npx tsc --noEmit

# 2. Production Optimized Bundle Creation
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
