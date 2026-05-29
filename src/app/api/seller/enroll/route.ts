import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const enrollSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters long."),
  companyName: z.string().min(2, "Company/Studio name must be at least 2 characters."),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const result = enrollSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((err) => err.message).join(" ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { bio, companyName } = result.data;

    // Check if seller profile already exists
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "You are already registered as a creator." },
        { status: 400 }
      );
    }

    // Execute atomic transaction: create profile & update user role
    const profile = await prisma.$transaction(async (tx) => {
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: session.user.id,
          bio,
          companyName,
          verified: false,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "SELLER" },
      });

      return sellerProfile;
    });

    return NextResponse.json({
      message: "Congratulations! You are now registered as a Creator.",
      role: "SELLER",
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Seller Enrollment API Error:", error);
    return NextResponse.json({ error: "Failed to process creator registration." }, { status: 500 });
  }
}
