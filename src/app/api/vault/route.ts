import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/vault - Retrieve all purchased products for the active user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // Get all PAID orders for this user
    const paidOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "PAID",
      },
      select: {
        id: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
          },
        },
      },
    });

    // Flatten all purchased product IDs
    const purchasedProductIds = Array.from(
      new Set(paidOrders.flatMap((order) => order.items.map((item) => item.productId)))
    );

    // Fetch product details for these IDs (excluding promptContent)
    const vaultProducts = await prisma.product.findMany({
      where: {
        id: { in: purchasedProductIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        model: true,
        thumbnail: true,
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            companyName: true,
            verified: true,
          },
        },
      },
    });

    return NextResponse.json(vaultProducts);
  } catch (error) {
    console.error("Vault Fetch API Error:", error);
    return NextResponse.json({ error: "Failed to load purchased assets." }, { status: 500 });
  }
}
