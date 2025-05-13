import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "entreprise") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const candidatures = await db.candidature.findMany({
    where: {
      stageId: id,
    },
    select: {
      id: true,
      etudiant: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          competences: true,
        },
      },
      date: true,
      statut: true,
      stage: {
        select: {
          statut: true,
          dateFin: true,
        },
      },
    },
  });

  const candidaturesWithDisable = candidatures.map((candidature) => ({
    ...candidature,
    disable:
      new Date(candidature.stage.dateFin) < new Date() ||
      candidature.stage.statut !== "Disponible",
  }));

  return NextResponse.json(candidaturesWithDisable);
}
