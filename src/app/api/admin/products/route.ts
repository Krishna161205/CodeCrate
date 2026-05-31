import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET /api/admin/products - List all products for moderation
export async function GET(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || ""; // "reported", "archived", "all"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (filter === "reported") {
      where.reported = true;
    } else if (filter === "archived") {
      where.archived = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { name: true }
        },
        seller: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Admin Fetch Products API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

// PUT /api/admin/products - Update product flags (archived, reported)
export async function PUT(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const body = await req.json();
    const { productId, archived, reported } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Product listing not found." }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (archived !== undefined) data.archived = archived;
    if (reported !== undefined) data.reported = reported;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data
    });

    return NextResponse.json({
      message: "Product listing updated successfully.",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Admin Update Product API Error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

// DELETE /api/admin/products - Hard delete an inappropriate product listing
export async function DELETE(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: "Product listing deleted successfully from marketplace." });
  } catch (error) {
    console.error("Admin Delete Product API Error:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
