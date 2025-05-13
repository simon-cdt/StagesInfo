import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "etudiant") {
    return NextResponse.json({ message: "Vous n'avez pas de candidatures" });
  }

  const ranking = await db.stage.findMany({
    where: {
      candidatures: {
        some: {
          etudiantId: session.user.id,
          statut: "Acceptée",
        },
      },
    },
    select: {
      id: true,
      evaluation: {
        select: {
          note: true,
          date: true,
          commentaire: true,
        },
      },
      titre: true,
      entreprise: {
        select: {
          nom: true,
          contact: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(ranking);
}
