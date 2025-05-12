import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const secteurs = await db.secteur.findMany({
    select: {
      id: true,
      label: true,
      couleur: true,
    },
  });

  return NextResponse.json(secteurs);
}
