"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export const updateOfferAdmin = async ({
  id,
  title,
  description,
  duration,
  startDate,
  endDate,
  location,
  skills,
  sectorId,
}: {
  id: string;
  title: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  location: string;
  skills: string[];
  sectorId: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const offer = await db.offer.findUnique({
      where: {
        id,
      },
      select: { companyId: true, status: true },
    });
    if (!offer || offer.status !== "Available") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire celà",
      };
    }

    const startDateType = new Date(startDate);
    startDateType.setHours(0, 0, 0, 0);
    const endDateType = new Date(endDate);
    endDateType.setHours(23, 59, 59, 999);

    await db.offer.update({
      where: { id },
      data: {
        title,
        description,
        duration,
        startDate: startDateType,
        endDate: endDateType,
        location: location,
        skills: skills.join(","),
        sector: {
          connect: { id: sectorId },
        },
      },
    });

    return {
      success: true,
      message: "L'offre de stage a bien été mise à jour",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const deleteOfferAdmin = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const offer = await db.offer.findUnique({
      where: {
        id,
      },
      select: { companyId: true, status: true },
    });
    if (!offer || offer.status !== "Available") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire celà",
      };
    }

    await db.submission.deleteMany({
      where: {
        offerId: id,
      },
    });

    await db.offer.delete({
      where: { id },
    });

    return {
      success: true,
      message: "L'offre de stage a bien été supprimée",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const createOfferAdmin = async ({
  companyId,
  title,
  description,
  duration,
  startDate,
  endDate,
  location,
  skills,
  sectorId,
}: {
  companyId: string;
  title: string;
  description: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  location: string;
  skills: string[];
  sectorId: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    await db.offer.create({
      data: {
        title,
        description,
        duration,
        startDate,
        endDate,
        location,
        skills: skills.join(","),
        companyId,
        sectorId,
      },
    });

    return {
      success: true,
      message: "L'offre de stage a bien été créée",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
