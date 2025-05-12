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

  const stage = await db.stage.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      secteur: {
        select: {
          label: true,
          couleur: true,
        },
      },
      titre: true,
      statut: true,
      lieu: true,
      duree: true,
      dateDebut: true,
      dateFin: true,
      description: true,
      competences: true,
      entreprise: {
        select: {
          nom: true,
          adresse: true,
          email: true,
          contact: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
      candidatures: {
        select: {
          etudiantId: true,
        },
      },
    },
  });

  let alreadyPosted = false;
  if (session?.user?.id) {
    alreadyPosted = !!stage?.candidatures.find(
      (candidature) => candidature.etudiantId === session.user.id,
    );
  }

  const dateToComapre = stage?.dateFin ? stage?.dateFin : new Date();
  const expiree = new Date() > dateToComapre;

  return NextResponse.json({
    stage,
    expiree,
    alreadyPosted,
  });
}
