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

// GET /api/admin/sellers - Fetch all seller profiles
export async function GET() {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const sellers = await prisma.sellerProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error("Admin Fetch Sellers API Error:", error);
    return NextResponse.json({ error: "Failed to fetch seller profiles." }, { status: 500 });
  }
}

// PUT /api/admin/sellers - Approve/Reject seller profile, or toggle Verified badge
export async function PUT(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const body = await req.json();
    const { sellerId, verified, action } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required." }, { status: 400 });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found." }, { status: 404 });
    }

    if (action === "reject") {
      // Rejection: Deletes the seller profile and demotes the user role to BUYER
      await prisma.$transaction(async (tx) => {
        // Delete seller profile (which cascades deletes to products due to relation onDelete: Cascade)
        await tx.sellerProfile.delete({
          where: { id: sellerId }
        });

        // Demote the user back to BUYER
        await tx.user.update({
          where: { id: seller.userId },
          data: { role: "BUYER" }
        });
      });

      return NextResponse.json({
        message: "Seller account successfully rejected and demoted to standard buyer."
      });
    }

    // Toggle verified status (Verified Creator badge)
    const updatedSeller = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        verified: verified !== undefined ? verified : !seller.verified
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: `Seller profile ${updatedSeller.verified ? "verified" : "unverified"} successfully.`,
      seller: updatedSeller
    });
  } catch (error) {
    console.error("Admin Update Seller API Error:", error);
    return NextResponse.json({ error: "Failed to update seller profile." }, { status: 500 });
  }
}
