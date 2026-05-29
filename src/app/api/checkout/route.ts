import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const checkoutSchema = z.object({
  productIds: z.array(z.string().uuid("Invalid product ID.")).min(1, "Cart cannot be empty."),
  cardName: z.string().min(2, "Billing name must be provided."),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to purchase." }, { status: 401 });
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((err) => err.message).join(" ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { productIds } = result.data;

    // Fetch products to verify pricing and availability
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more items in the cart are invalid." }, { status: 400 });
    }

    // Compute total price using snapshotted database prices
    const totalAmount = products.reduce((sum, item) => sum + Number(item.price), 0);
    const mockPaymentIntent = `PAY-REF-${crypto.randomUUID().substring(0, 18).toUpperCase()}`;

    // Create order and order items atomically in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      const dbOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalPrice: totalAmount,
          status: "PAID", // immediate unlock upon mock checkout approval
          paymentIntent: mockPaymentIntent,
        },
      });

      const orderItemsData = products.map((prod) => ({
        orderId: dbOrder.id,
        productId: prod.id,
        price: prod.price,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // Optional: Clear database cart if it exists for this user
      const userCart = await tx.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      return dbOrder;
    });

    return NextResponse.json({
      message: "Payment authorized successfully.",
      orderId: order.id,
      paymentIntent: order.paymentIntent,
      totalAmount,
    }, { status: 201 });
  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Payment processing failed. Please try again." }, { status: 500 });
  }
}
