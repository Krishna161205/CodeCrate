import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized. Sellers only." }, { status: 403 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found." }, { status: 400 });
    }

    // Get all product IDs belonging to this seller
    const products = await prisma.product.findMany({
      where: { sellerId: sellerProfile.id },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    // Get all sold order items matching this seller's products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: { in: productIds },
        order: { status: "PAID" }, // only count completed/paid orders
      },
      include: {
        order: true,
      },
    });

    const totalSales = orderItems.length;
    const totalEarnings = orderItems.reduce((sum, item) => sum + Number(item.price), 0);
    const totalOrders = new Set(orderItems.map((item) => item.orderId)).size;

    return NextResponse.json({
      totalSales,
      totalOrders,
      totalEarnings,
      listedProductsCount: productIds.length,
    });
  } catch (error) {
    console.error("Seller Analytics API Error:", error);
    return NextResponse.json({ error: "Failed to load seller analytics." }, { status: 500 });
  }
}
