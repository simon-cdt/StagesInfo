"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";

export const noterEleve = async ({
  idStage,
  note,
  commentaire,
}: {
  idStage: string;
  note: string;
  commentaire: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    const stage = await db.stage.findUnique({
      where: { id: idStage },
      select: {
        entrepriseId: true,
        evaluation: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.role !== "entreprise" ||
      !stage ||
      stage.entrepriseId !== session.user.id ||
      stage.evaluation?.id !== undefined
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
      };
    }

    await db.evaluationStage.create({
      data: {
        note: parseInt(note),
        commentaire,
        date: new Date(),
        stageId: idStage,
      },
    });

    return {
      success: true,
      message: "L'évaluation a été enregistrée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const updateEvaluation = async ({
  id,
  note,
  commentaire,
}: {
  id: string;
  note: string;
  commentaire: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    const evaluation = await db.evaluationStage.findUnique({
      where: { id: id },
      select: {
        stage: {
          select: {
            entrepriseId: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.role !== "entreprise" ||
      !evaluation ||
      evaluation.stage.entrepriseId !== session.user.id
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
      };
    }

    await db.evaluationStage.update({
      where: { id },
      data: {
        note: parseInt(note),
        commentaire,
        date: new Date(),
      },
    });

    return {
      success: true,
      message: "L'évaluation a été mise à jour avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const deleteEvaluation = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    const evaluation = await db.evaluationStage.findUnique({
      where: { id: id },
      select: {
        stage: {
          select: {
            entrepriseId: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.role !== "entreprise" ||
      !evaluation ||
      evaluation.stage.entrepriseId !== session.user.id
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
      };
    }

    await db.evaluationStage.delete({
      where: { id },
    });

    return {
      success: true,
      message: "L'évaluation a été supprimée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};
