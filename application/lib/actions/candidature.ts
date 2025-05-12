"use server";

import { getServerSession } from "next-auth";
import { db } from "../db";
import { authOptions } from "../auth";

export const Postuler = async ({
  idStage,
  lettreMotivation,
  cv,
}: {
  idStage: string;
  lettreMotivation: File;
  cv?: File;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    const etudiant = await db.etudiant.findUnique({
      where: { id: session?.user.id },
    });
    if (!etudiant || !session) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      };
    }

    const lettreMotivationFile = await lettreMotivation.arrayBuffer();
    const cvFile = cv && (await cv.arrayBuffer());

    await db.candidature.create({
      data: {
        date: new Date(),
        lettreMotivation: Buffer.from(lettreMotivationFile),
        cv: cvFile ? Buffer.from(cvFile) : etudiant.cv,
        etudiantId: session?.user.id,
        stageId: idStage,
      },
    });

    return {
      success: true,
      message: "Candidature envoyée avec succès.",
    };
  } catch (error) {
    console.error("Erreur lors de la candidature:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi de la candidature.",
    };
  }
};

export const RetirerCandidature = async ({
  id,
}: {
  id: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    const candidature = await db.candidature.findUnique({
      where: { id },
      select: { etudiantId: true, statut: true },
    });
    if (
      !candidature ||
      !session ||
      session.user.id !== candidature.etudiantId ||
      candidature.statut !== "EnAttente"
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      };
    }

    await db.candidature.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Candidature supprimée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};
