import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as argon2 from "argon2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nom,
      email,
      mdp,
      adresse,
      contactEmail,
      contactNom,
      contactPrenom,
      secteurs,
    } = body;

    const entrepriseExiste = await db.entreprise.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (entrepriseExiste) {
      return NextResponse.json(
        { error: "L'e-mail est déjà utilisé." },
        { status: 400 },
      );
    }

    const mdpHashe = await argon2.hash(mdp);

    await db.entreprise.create({
      data: {
        nom,
        email,
        mdp: mdpHashe,
        adresse,
        contact: {
          create: {
            nom: contactNom,
            prenom: contactPrenom,
            email: contactEmail,
          },
        },
        secteurs: {
          createMany: {
            data: secteurs.map((id: number) => ({ idSecteur: id })),
          },
        },
      },
    });

    return NextResponse.json({ message: "Compte créé avec succès" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 },
    );
  }
}
