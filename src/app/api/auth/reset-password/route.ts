import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token i hasło są wymagane" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć minimum 8 znaków" },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Nieprawidłowy lub wygasły link. Spróbuj ponownie." },
        { status: 400 }
      );
    }

    // Check if expired
    if (resetToken.expires < new Date()) {
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: "Link wygasł. Poproś o nowy link do resetowania hasła." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await db.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // Delete used token
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json(
      { message: "Hasło zostało zmienione. Możesz się teraz zalogować." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}
