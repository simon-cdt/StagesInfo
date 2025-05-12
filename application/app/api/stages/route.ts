import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const secteurs = await db.stage.findMany({
    where: {
      statut: "Disponible",
      dateDebut: { lte: new Date() },
      dateFin: { gte: new Date() },
    },
    select: {
      id: true,
      titre: true,
      entreprise: {
        select: {
          nom: true,
        },
      },
      secteur: {
        select: {
          label: true,
          couleur: true,
        },
      },
      duree: true,
      dateDebut: true,
      dateFin: true,
      lieu: true,
    },
    orderBy: {
      dateDebut: "asc",
    },
  });

  return NextResponse.json(secteurs);
}
