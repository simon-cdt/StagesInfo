"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";

export const ratingStudent = async ({
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

    const offer = await db.offer.findUnique({
      where: { id: offerId },
      select: {
        companyId: true,
        evaluation: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.role !== "company" ||
      !offer ||
      offer.companyId !== session.user.id ||
      offer.evaluation?.id !== undefined
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
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

export const updateRate = async ({
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

    const rate = await db.evaluationOffer.findUnique({
      where: { id: id },
      select: {
        offer: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.role !== "company" ||
      !rate ||
      rate.offer.companyId !== session.user.id
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à effectuer cette action.",
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

export const deleteRate = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    const rate = await db.evaluationOffer.findUnique({
      where: { id: id },
      select: {
        offer: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.role !== "company" ||
      !rate ||
      rate.offer.companyId !== session.user.id
    ) {
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
