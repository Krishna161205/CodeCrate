import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { decryptPrompt } from "@/lib/crypto";

// GET /api/vault/[id] - Decrypt and fetch purchased prompt content
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const productId = params.id;

    // Verify purchase: search for any paid order for this user containing this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: "PAID",
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Access denied. You must purchase this prompt to unlock its contents." },
        { status: 403 }
      );
    }

    // Fetch the product from PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        promptContent: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Decrypt AES-256 encrypted prompt content
    const decryptedContent = decryptPrompt(product.promptContent);

    return NextResponse.json({
      id: product.id,
      title: product.title,
      prompt: decryptedContent,
    });
  } catch (error) {
    console.error("Vault Unlock API Error:", error);
    return NextResponse.json({ error: "Failed to unlock prompt content." }, { status: 500 });
  }
}
