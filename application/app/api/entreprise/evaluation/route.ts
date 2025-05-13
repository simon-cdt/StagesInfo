import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "entreprise") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const candidatures = await db.candidature.findMany({
    where: {
      statut: "Acceptée",
      stage: {
        entrepriseId: session.user.id,
      },
    },
    select: {
      id: true,
      etudiant: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      stage: {
        select: {
          id: true,
          titre: true,
          evaluation: {
            select: {
              id: true,
              note: true,
              commentaire: true,
              date: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(candidatures);
}
