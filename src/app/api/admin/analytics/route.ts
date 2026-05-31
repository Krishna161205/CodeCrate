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

// GET /api/admin/analytics - Retrieve all dashboard metrics and system monitoring logs
export async function GET() {
  try {
    if (!(await ensureAdmin())) {
      return NextResponse.json({ error: "Access Denied. Admins only." }, { status: 403 });
    }

    // 1. Calculate General Aggregations
    const totalUsers = await prisma.user.count();
    const totalSellers = await prisma.sellerProfile.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    // Sum up totalPrice on successfully paid orders (or all orders since it's a dev database)
    const ordersRevenue = await prisma.order.aggregate({
      _sum: {
        totalPrice: true
      }
    });
    const totalRevenue = Number(ordersRevenue._sum.totalPrice || 0);

    // 2. New Users registered this calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // 3. System Monitor - Auditing Recent Activities
    const recentRegistrations = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const recentProductUploads = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
        newUsersThisMonth
      },
      monitor: {
        recentRegistrations,
        recentOrders,
        recentProductUploads
      }
    });
  } catch (error) {
    console.error("Admin Analytics API Error:", error);
    return NextResponse.json({ error: "Failed to compile administration metrics." }, { status: 500 });
  }
}
