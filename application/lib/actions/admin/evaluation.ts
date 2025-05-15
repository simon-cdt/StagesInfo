"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const CreateRatingStudentAdmin = async ({
  offerId,
  rating,
  comment,
}: {
  offerId: string;
  rating: string;
  comment: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
      };
    }

    const offer = await db.offer.findUnique({
      where: { id: offerId },
      select: {
        evaluation: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!offer || offer.evaluation?.id !== undefined) {
      return {
        success: false,
        message: "L'étudiant a déjà été .",
      };
    }

    await db.evaluationOffer.create({
      data: {
        rating: parseInt(rating),
        comment,
        date: new Date(),
        offerId,
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

export const updateRateAdmin = async ({
  id,
  rating,
  comment,
}: {
  id: string;
  rating: string;
  comment: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
      };
    }

    const rate = await db.evaluationOffer.findUnique({
      where: { id: id },
      select: {
        id: true,
      },
    });

    if (!rate) {
      return {
        success: false,
        message: "L'évaluation n'exsite pas.",
      };
    }

    await db.evaluationOffer.update({
      where: { id },
      data: {
        rating: parseInt(rating),
        comment,
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

export const deleteRateAdmin = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
      };
    }

    await db.evaluationOffer.delete({
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
