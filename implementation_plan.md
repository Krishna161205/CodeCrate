# Implementation Plan - CodeCrate Full-Stack AI Prompt Marketplace

This plan outlines the architecture, database schema, authentication framework, API layers, and frontend integration strategy for **CodeCrate**, a premium developer-focused marketplace for AI Prompts and workflows. It leverages **Next.js 14 App Router**, **Prisma ORM**, **Tailwind CSS**, **Zustand**, and **NextAuth.js** to build an obsidian-themed, glassmorphic SaaS.

---

## User Review Required

> [!IMPORTANT]
> **Database Configuration**: The application will connect to a PostgreSQL database via Prisma. You will need to provide a working PostgreSQL database connection string in your `.env` file (`DATABASE_URL`).
> **Stitch Screen Integration**: We have downloaded the 4 existing screens (Landing Page, Explore Marketplace, Product Details, My Vault Dashboard). I will convert them into dynamic, responsive React components in Next.js. I will also use Stitch's text-to-UI capability to generate the remaining 6 screens (Cart, Checkout, Auth, Seller Dashboard, Order Tracking Timeline, Profile Settings) to maintain 100% style consistency.

> [!WARNING]
> **Prompt Security**: To protect prompt creators, the raw prompt instructions (`promptContent`) must be securely hidden from API responses unless the current user has verified ownership (i.e. has paid for the product). We will enforce this at the database and middleware level.

---

## Open Questions

> [!NOTE]
> Please review and approve these options or write in your preferences in the feedback:
> 1. **Database Hosting**: Will you be hosting PostgreSQL locally or using a serverless provider like Neon, Supabase, or AWS RDS? (I will provide a fully configured Prisma schema compatible with standard PostgreSQL).
> 2. **Authentication Flow**: For credential-based auth, I will use `bcrypt` to hash passwords and NextAuth JWT. Do you also want OAuth providers (e.g., Google or GitHub)?

---

## Proposed Changes

### 1. Backend & Database Component

We will implement the complete database models using Prisma ORM.

#### [NEW] [schema.prisma](file:///c:/Users/krish/Desktop/Code%20Crate/prisma/schema.prisma)

Define standard PostgreSQL schema with the following relations:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  CANCELLED
}

model User {
  id            String         @id @default(uuid())
  name          String?
  email         String         @unique
  password      String // Hashed password
  role          Role           @default(BUYER)
  avatar        String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  sellerProfile SellerProfile?
  reviews       Review[]
  orders        Order[]
  wishlist      Wishlist[]
  cart          Cart?
}

model SellerProfile {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio         String?
  companyName String?
  rating      Float     @default(0.0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  products    Product[]
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  products    Product[]
}

model Product {
  id            String        @id @default(uuid())
  title         String
  description   String
  price         Float
  promptContent String // Hidden behind payment validation
  model         String // GPT, Claude, Gemini, Midjourney, etc.
  thumbnail     String?
  rating        Float         @default(0.0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  categoryId    String
  category      Category      @relation(fields: [categoryId], references: [id])
  sellerId      String
  seller        SellerProfile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  
  reviews       Review[]
  orderItems    OrderItem[]
  wishlistItems Wishlist[]
  cartItems     CartItem[]
}

model Review {
  id        String   @id @default(uuid())
  rating    Int // 1 to 5 stars
  comment   String?
  createdAt DateTime @default(now())
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId]) // One review per user per product
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)

  @@unique([cartId, productId])
}

model Order {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  totalPrice    Float
  status        OrderStatus @default(PENDING)
  paymentIntent String?     // Mock transaction reference
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  items         OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  price     Float // Snapshotted price at checkout
}

model Wishlist {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}
```

---

### 2. API Routes Development

We will create modular Next.js Route Handlers (`src/app/api/...`):

*   **Auth APIs (`/api/auth/...`)**: Managed natively by NextAuth.js for registration, login, logout, and token dispatching.
*   **Products APIs (`/api/products`)**:
    *   `GET /api/products`: Search, filtering (by price range, model type, category, and minimum rating), and pagination.
    *   `POST /api/products`: Create a product (Seller only, verified with JWT).
    *   `PUT /api/products/[id]`: Update product.
    *   `DELETE /api/products/[id]`: Remove product.
*   **Reviews APIs (`/api/reviews`)**:
    *   `POST /api/reviews`: Create a verified rating (requires purchase verification).
*   **Cart APIs (`/api/cart`)**:
    *   `GET`, `POST`, `DELETE`: Add, fetch, or remove items from database-persisted shopping carts.
*   **Checkout & Order APIs (`/api/checkout`)**:
    *   `POST /api/checkout`: Mock payment gateway checkout, order logging, empty user cart, and immediate digital vault delivery.
*   **Vault APIs (`/api/vault`)**:
    *   `GET /api/vault`: Fetches user's purchased items.
    *   `GET /api/vault/[productId]`: Decrypts and retrieves the sensitive `promptContent` **only** after validating that a completed order exists for this user and product.

---

### 3. State Management (Zustand)

Create front-end state containers:
*   `useCartStore`: Fast cart updates, local-cache sync, and item counting.
*   `useAuthStore`: Active user role, session profile, and state check.

---

### 4. Layout & UI Screens Plan

We will map the application screens to Next.js routes:

*   `/` (Landing Page): Futuristic obsidian introduction, product showcases, call to action.
*   `/explore` (Product Listing): Advanced filters, model types, categories, prices, bento grids of trending prompts.
*   `/products/[id]` (Product Detail): In-depth features, rating display, mock preview, "Add to Cart", related prompts, peer-verified badge.
*   `/vault` (User Dashboard): Clipboard kopier, active order timelines, search across digital assets.
*   `/cart` (Cart Page): Order item listing, total calculators, secure checkout trigger.
*   `/checkout` (Checkout Page): Premium dark credit-card form with immediate loading shimmers.
*   `/auth/login` & `/auth/register` (Authentication): Neon outline panels, strict Zod validation.
*   `/seller` (Seller Dashboard): Revenue analytics graphs, prompt publisher panel, sales listing.
*   `/settings` (Profile Settings): Avatar upload, details updating, user role switching (Buyer <-> Seller).

---

## Verification Plan

### Automated Tests
- Setup database migrations using `npx prisma migrate dev` or `npx prisma db push` with a local/Neon DB.
- Run typechecking: `npm run build` or `npx tsc --noEmit` to ensure everything compiles with zero errors.

### Manual Verification
- Test registration, role-switching (Buyer to Seller), adding products, placing orders, mock payments, and clipboard copy in the Vault dashboard.
- Verify security boundaries: verify that calling `/api/vault/[productId]` directly in postman/fetch without purchase verification blocks the raw prompt code correctly.
