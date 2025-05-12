"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import * as argon2 from "argon2";

export const getEtudiantSession = async ({
  id,
}: {
  id: string;
}): Promise<
  | { success: false; message: "Vous n'êtes pas connecté." }
  | {
      success: true;
      etudiant: {
        nom: string;
        prenom: string;
        email: string;
        competences: string;
      };
    }
> => {
  const user = await db.etudiant.findUnique({
    where: {
      id,
    },
    select: {
      nom: true,
      prenom: true,
      email: true,
      competences: true,
    },
  });
  if (!user) {
    return { success: false, message: "Vous n'êtes pas connecté." };
  }

  return {
    success: true,
    etudiant: {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      competences: user.competences,
    },
  };
};

export const createEtudiant = async ({
  nom,
  prenom,
  email,
  mdp,
  competences,
  cv,
}: {
  nom: string;
  prenom: string;
  email: string;
  mdp: string;
  competences: string;
  cv: File;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Compte créé avec succès." }
> => {
  try {
    const etudiantExiste = await db.etudiant.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (etudiantExiste) {
      return { success: false, message: "L'e-mail est déjà utilisé." };
    }

    const mdpHashe = await argon2.hash(mdp);
    const arrayBuffer = await cv.arrayBuffer();
    const newCv = Buffer.from(arrayBuffer);

    await db.etudiant.create({
      data: {
        nom,
        prenom,
        email,
        mdp: mdpHashe,
        competences: competences.toString(),
        cv: newCv,
      },
    });

    return { success: true, message: "Compte créé avec succès." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};

export const modifierEtudiant = async ({
  nom,
  prenom,
  email,
  competences,
  cv,
}: {
  nom: string;
  prenom: string;
  email: string;
  competences: string;
  cv: File | undefined;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Informations modifiées avec succès." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const user = await db.etudiant.findUnique({
      where: {
        id: session.user.id,
      },
      select: { id: true, cv: true },
    });
    if (!user) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }

    const emailExist = await db.etudiant.findUnique({
      where: {
        email: email,
      },
      select: { id: true },
    });
    if (emailExist && emailExist.id !== user.id) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    let newCv: Buffer | undefined;
    if (typeof cv !== "undefined") {
      console.log(cv);

      if (!(cv instanceof File)) {
        return { success: false, message: "Le fichier CV est invalide." };
      }
      const arrayBuffer = await cv.arrayBuffer();
      newCv = Buffer.from(arrayBuffer);
    }

    await db.etudiant.update({
      where: {
        id: user.id,
      },
      data: {
        nom: nom,
        prenom: prenom,
        email: email,
        competences,
        cv: newCv ?? user.cv,
      },
    });

    return { success: true, message: "Informations modifiées avec succès." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};
