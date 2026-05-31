import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Helper: Ensure user is admin
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET /api/admin/users - List, search, and filter users
export async function GET(req: Request) {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        suspended: true,
        createdAt: true,
        sellerProfile: {
          select: {
            id: true,
            companyName: true,
            verified: true,
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin Fetch Users API Error:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

// PUT /api/admin/users - Promote/Demote roles or Suspend/Unsuspend user
export async function PUT(req: Request) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, suspended } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // Prevent self-demotion or self-suspension
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot demote or suspend your own admin account." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (role !== undefined) data.role = role;
    if (suspended !== undefined) data.suspended = suspended;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
      }
    });

    return NextResponse.json({
      message: "User account updated successfully.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Admin Update User API Error:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user account
export async function DELETE(req: Request) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: "User account deleted successfully." });
  } catch (error) {
    console.error("Admin Delete User API Error:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
