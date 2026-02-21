import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api/auth";
import { badRequest, forbidden, notFound, serverError } from "@/lib/api/errors";
import { TransactionType, TransactionStatus } from "@prisma/client";

// POST /api/payments/mock — simulate payment for a booking
export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) return badRequest("bookingId jest wymagane");

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          include: {
            host: {
              include: { user: { select: { id: true, email: true } } },
            },
          },
        },
        guest: {
          select: {
            id: true,
            email: true,
            guestProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!booking) return notFound("Rezerwacja nie znaleziona");
    if (booking.guestId !== result.user.id) return forbidden("To nie jest Twoja rezerwacja");
    if (booking.status !== "APPROVED") {
      return badRequest("Rezerwacja musi być zatwierdzona przed płatnością");
    }

    // Check if already paid
    const existingTransaction = await db.transaction.findFirst({
      where: {
        bookingId,
        type: TransactionType.CHARGE,
        status: TransactionStatus.COMPLETED,
      },
    });

    if (existingTransaction) {
      return badRequest("Płatność została już zrealizowana");
    }

    // Create mock transaction
    const transaction = await db.transaction.create({
      data: {
        bookingId,
        type: TransactionType.CHARGE,
        amount: booking.totalPrice,
        status: TransactionStatus.COMPLETED,
        stripePaymentId: `mock_pi_${Date.now().toString(36)}`,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      booking: {
        id: booking.id,
        status: booking.status,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    console.error("POST /api/payments/mock error:", error);
    return serverError();
  }
}
