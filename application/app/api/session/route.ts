import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.role) {
    return NextResponse.json({
      message: "Veuillez vous connecter pour bénéficier de cette page.",
    });
  }

  let student: {
    name: string;
    firstName: string;
    email: string;
    resume: Uint8Array<ArrayBufferLike>;
    skills: string;
  } | null = null;

  if (session.user.role === "student") {
    student = await db.student.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        firstName: true,
        email: true,
        resume: true,
        skills: true,
      },
    });
  }

  return NextResponse.json(student);
}
