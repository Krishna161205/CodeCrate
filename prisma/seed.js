const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = new PrismaClient();

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = Buffer.from("f5e7b8a9d0c1b2a3f5e7b8a9d0c1b2a3"); // identical development key for seeding decrypt consistency
const IV_LENGTH = 16;

function encryptSeedPrompt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

async function main() {
  console.log("Starting database seeding process...");

  // 1. Clean up existing records safely
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.sellerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleaned up.");

  // 2. Create Categories
  const codingCategory = await prisma.category.create({
    data: {
      name: "Coding Prompts",
      slug: "coding-prompts",
      description: "Complex refactoring, architectural patterns, and boilerplate generation for 20+ languages.",
    },
  });

  const dataCategory = await prisma.category.create({
    data: {
      name: "Data Analysis",
      slug: "data-analysis",
      description: "Automate SQL optimization and complex ETL workflows.",
    },
  });

  const academicCategory = await prisma.category.create({
    data: {
      name: "Academic Tools",
      slug: "academic-tools",
      description: "Citation generators and research summarization chains.",
    },
  });

  const visualsCategory = await prisma.category.create({
    data: {
      name: "High-Fidelity Visuals",
      slug: "visuals",
      description: "Master Midjourney V6 and DALL-E 3 with photorealistic prompts.",
    },
  });

  console.log("Categories created.");

  // 3. Create Seed Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const alex = await prisma.user.create({
    data: {
      name: "Alex Chen",
      email: "alex@codecrate.ai",
      password: hashedPassword,
      role: "SELLER",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCboz8VEyqlgPCSm6yD2mYPjX3uXmx-qW3BkagPcYGOT-oDJ4nLC7x-40HcnEmWz_myDC4KmP_IRQddmDy86xXTnsAtE1wAyPGHrVMbO4NVb4_5XT20tMFPrNPWa9MweHQXkNLeqgPX99wYLlIgwuLOdOQ03CHupmUV1c8s20tRI6CFq2ugQf_QpqvcaITP9ZRb-qzmGphJ_a2-XxF1aLGI-QwtUYW-Z8cVGn1kiqId4tp0Ob5R1guGShY1-lzHVN3CawRZBbyV2KnP",
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@codecrate.ai",
      password: hashedPassword,
      role: "BUYER",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=JaneSmith",
    },
  });

  console.log("Seed users created.");

  // 4. Create Seller Profile for Alex
  const alexProfile = await prisma.sellerProfile.create({
    data: {
      userId: alex.id,
      bio: "Senior software engineer & prompt architect. Building automated developer forge agents.",
      companyName: "DevScale Labs",
      verified: true,
    },
  });

  console.log("Seller profile instantiated.");

  // 5. Create Prompts/Products
  const p1 = await prisma.product.create({
    data: {
      title: "Full-Stack Architect GPT",
      slug: "full-stack-architect-gpt",
      description: "Enterprise-grade system prompt for multi-agent coordination with built-in reflection cycles.",
      price: 24.00,
      promptContent: encryptSeedPrompt(
        "SYSTEM PROMPT: You are a Full-Stack Software Architect expert in Next.js 14, TypeScript, Prisma, and Tailwind CSS. Review the following codebase. Enforce maximum modularity, absolute path imports (@/*), and clean Separation of Concerns..."
      ),
      model: "GPT-4o",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuAicJrrLuWVEls7kf8HkmmFd77Lkx1pH-dq5iCt4ZPu-2bkk1OpAiqJLHB_F3Up4UR6TXUlXXppo8AkOb9WM52V3URkdly4qzc4jhzCNo_LfB9VxdfMb5KVW8zuPAMiroWe0e5WLP6UfZaFhGFM6hzi3M-T0MJTlmMCX-cuZ48aIHpFre210LaUOtts_OtrdZO9RFUY6wz3pGf5EmJeJMmLTBLWIJ52cHyQrJJwgQXinZs2UIroNaTogiGigqaBe4QXPiKsn6dgVIzd",
      rating: 4.9,
      categoryId: codingCategory.id,
      sellerId: alexProfile.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      title: "Data Science Pipeline v2",
      slug: "data-science-pipeline-v2",
      description: "Automate SQL optimization and complex ETL workflows with high efficiency.",
      price: 39.00,
      promptContent: encryptSeedPrompt(
        "SYSTEM PROMPT: You are a Principal Data Scientist. Optimize this Postgres database query sequence for pgvector embeddings. Use cosine similarity filters and structure the aggregate pipeline exactly as follows..."
      ),
      model: "Claude 3.5 Sonnet",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgrk1QN5eog4Kv-bCxKilRnQ2f2vIx3VaPuN75Lm2j-1wr0zf2eALG9Tqza2ih_eCNEOv6MuHtodtrXWQfdK60dbassPO9RuVc1tQiLS7PDVPlggY8W32LGp9bxuQvmaNFZA0ujZp3LhxR5fsuqiavmRt0LIVSYPMh-OpfVD0w3JttpdlwxFuaigdXn1BJKmaM50MY0ivN-4SjPfKJH6WU4oi2CPHzQEkqQs-6dCPu4_H7x8X6Ka-sH-IlEPu8Fjd20JOiRPMFeoKr",
      rating: 5.0,
      categoryId: dataCategory.id,
      sellerId: alexProfile.id,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      title: "Cinematic Vision Midjourney",
      slug: "cinematic-vision-midjourney",
      description: "Create photorealistic imagery with Midjourney V6, featuring low-key neon rim lighting.",
      price: 12.00,
      promptContent: encryptSeedPrompt(
        "PROMPT TEXT: Cinematic digital art close-up shot of complex circuit logic, glowing neon fibers flowing with electric blue and purple rays, obsidian background, soft blue rim light, high precision render, 3D abstract waves, --ar 16:9 --style raw --v 6.0"
      ),
      model: "Midjourney V6",
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVRfF5peSxrIBDRAKwBHQi9skoqTHDGOGvuDn6Q865JL4bmZ59ZVtyfcd0v-ei3NJQXQ9hwThVcRTr_ykxetTtDuOI86BP_e-T_xvtUGCFuU-YJEz49v1JYnpZHT8Pa7XItdnftXQBc2jpI01IOPDlNxfx03j3NDTFUFS6l3lTZRFGmA3542LRYyNttByGOfBqW3lF9Tr8F2lbpJgqzmTtswRk6p37zwEQIPZdORNSYsWpXXaInToNhTe0GkSFPtIjPkRSDnSoNvrK",
      rating: 4.8,
      categoryId: visualsCategory.id,
      sellerId: alexProfile.id,
    },
  });

  console.log("Seed products created.");

  // 6. Create Product Images gallery
  await prisma.productImage.createMany({
    data: [
      { url: p1.thumbnail, productId: p1.id },
      { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSZElzeNCbCx33yYaZkkVc9q-iKamb066Wc0p1Up6Kmebk82nJGr1JREB-HwL7N4q_88Y9AooCvfBlrrz1spstDgbn_9tY7feJVzfSqrzmBpgtHbAjTyZ7zspN-HcOyvReJvabIhwrv2GRekOs2JPZ6GOTMPUEi4wJiLdluMAIqgFRUlhM6Uko7TMn_hjASmDkhp3I944OQB0E4MAulohRAOBzUgULzELqGbjkJRkP1ezuVjyeDRovBkWZs0g6YLNuJAox-iQvvRn_", productId: p1.id },
      { url: p2.thumbnail, productId: p2.id },
      { url: p3.thumbnail, productId: p3.id },
    ],
  });

  // 7. Initialize Shopping Carts
  await prisma.cart.create({
    data: {
      userId: buyerUser.id,
    },
  });

  console.log("Shopping cart initialized.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
