import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as argon2 from "argon2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, prenom, email, password, competences, cv } = body;

    const etudiantExiste = await db.etudiant.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (etudiantExiste) {
      return NextResponse.json(
        { error: "L'e-mail est déjà utilisé." },
        { status: 400 },
      );
    }

    const mdpHashe = await argon2.hash(password);
    const buffer = Buffer.from(cv.data);

    await db.etudiant.create({
      data: {
        nom,
        prenom,
        email,
        mdp: mdpHashe,
        competences: competences.toString(),
        cv: buffer,
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
