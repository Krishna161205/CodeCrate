import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { encryptPrompt } from "@/lib/crypto";
import { z } from "zod";
import crypto from "crypto";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.number().positive("Price must be greater than zero."),
  promptContent: z.string().min(5, "Prompt content must be at least 5 characters."),
  model: z.string().min(2, "AI Model must be specified."),
  categoryId: z.string().uuid("Invalid category ID."),
  imageUrl: z.string().url("Invalid image URL.").optional(),
});

// GET /api/products - Browse prompts with filtering and search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const model = searchParams.get("model") || "";
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      archived: false
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (model) {
      where.model = { contains: model, mode: "insensitive" };
    }

    if (maxPrice !== null) {
      where.price = { lte: maxPrice };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        model: true,
        thumbnail: true,
        rating: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        seller: {
          select: {
            companyName: true,
            verified: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch Products API Error:", error);
    return NextResponse.json({ error: "Failed to retrieve products catalog." }, { status: 500 });
  }
}

// POST /api/products - Create a new prompt (Sellers only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized. Sellers only." }, { status: 403 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return NextResponse.json(
        { error: "Seller profile not found. Please enroll first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((err) => err.message).join(" ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { title, description, price, promptContent, model, categoryId, imageUrl } = result.data;

    // Helper: Slugify title
    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    const uniqueSuffix = crypto.randomBytes(3).toString("hex");
    const slug = `${slugBase}-${uniqueSuffix}`;

    // Cryptographically encrypt prompt content before DB write
    const encryptedPrompt = encryptPrompt(promptContent);

    const defaultThumbnail = imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price,
        promptContent: encryptedPrompt,
        model,
        thumbnail: defaultThumbnail,
        categoryId,
        sellerId: sellerProfile.id,
      },
    });

    // Create default image relation
    await prisma.productImage.create({
      data: {
        url: defaultThumbnail,
        productId: product.id,
      },
    });

    return NextResponse.json(
      { message: "Prompt listed successfully.", slug: product.slug, id: product.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Product API Error:", error);
    return NextResponse.json({ error: "Failed to list prompt in marketplace." }, { status: 500 });
  }
}
