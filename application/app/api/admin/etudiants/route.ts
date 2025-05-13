import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const etudiants = await db.etudiant.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        competences: true,
        candidatures: {
          select: {
            statut: true,
          },
        },
      },
    });

    const etudiantsWithDeletable = etudiants.map((etudiant) => {
      const hasAcceptedCandidature = etudiant.candidatures.some(
        (candidature) => candidature.statut === "Acceptée",
      );
      return {
        ...etudiant,
        deleteable: !hasAcceptedCandidature,
        candidatures: undefined,
      };
    });

    return NextResponse.json(etudiantsWithDeletable);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
