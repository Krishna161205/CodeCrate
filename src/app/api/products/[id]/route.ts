import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { encryptPrompt } from "@/lib/crypto";

// PUT /api/products/[id] - Update product details (Seller only, must be owner)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Enforce owner verification
    if (product.sellerId !== sellerProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized. You do not own this product listing." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, price, promptContent, model, categoryId } = body;

    const data: any = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (price) data.price = Number(price);
    if (model) data.model = model;
    if (categoryId) data.categoryId = categoryId;
    if (promptContent) {
      data.promptContent = encryptPrompt(promptContent);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({
      message: "Prompt listing updated successfully.",
      id: updatedProduct.id,
    });
  } catch (error) {
    console.error("Update Product API Error:", error);
    return NextResponse.json({ error: "Failed to update product details." }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete a product listing (Seller only, must be owner)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Enforce owner verification
    if (product.sellerId !== sellerProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized. You do not own this product listing." },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Prompt listing deleted successfully." });
  } catch (error) {
    console.error("Delete Product API Error:", error);
    return NextResponse.json({ error: "Failed to delete product listing." }, { status: 500 });
  }
}
