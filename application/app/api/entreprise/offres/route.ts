import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "entreprise") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stages = await db.stage.findMany({
    where: {
      entrepriseId: session.user.id,
    },
    select: {
      id: true,
      titre: true,
      description: true,
      secteur: {
        select: {
          id: true,
          couleur: true,
          label: true,
        },
      },
      duree: true,
      dateDebut: true,
      dateFin: true,
      lieu: true,
      statut: true,
      competences: true,
    },
  });

  const currentDate = new Date();

  stages.forEach((stage) => {
    if (
      stage.dateFin &&
      new Date(stage.dateFin) < currentDate &&
      stage.statut !== "Pourvue"
    ) {
      stage.statut = "Expirée";
    }
  });

  return NextResponse.json(stages);
}
