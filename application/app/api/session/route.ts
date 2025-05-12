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

  let user: {
    nom: string;
    prenom: string;
    email: string;
    cv: Uint8Array<ArrayBufferLike>;
    competences: string;
  } | null = null;

  if (session.user.role === "etudiant") {
    user = await db.etudiant.findUnique({
      where: { id: session.user.id },
      select: {
        nom: true,
        prenom: true,
        email: true,
        cv: true,
        competences: true,
      },
    });
  }

  return NextResponse.json(user);
}
