import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "etudiant") {
    return NextResponse.json({ message: "Vous n'avez pas de candidatures" });
  }

  const candidatures = await db.candidature.findMany({
    where: {
      etudiantId: session.user.id,
    },
    select: {
      id: true,
      date: true,
      statut: true,
      stage: {
        select: {
          id: true,
          titre: true,
          statut: true,
          entreprise: {
            select: {
              nom: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(candidatures);
}
