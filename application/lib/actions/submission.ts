"use server";

import { getServerSession } from "next-auth";
import { db } from "../db";
import { authOptions } from "../auth";

export const submitSubmission = async ({
  offerId,
  motivationLetter,
  resume,
}: {
  offerId: string;
  motivationLetter: File;
  resume?: File;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    const student = await db.student.findUnique({
      where: { id: session?.user.id },
    });
    if (!student || !session) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      };
    }

    const motvationLetterFile = await motivationLetter.arrayBuffer();
    const resumeFile = resume && (await resume.arrayBuffer());

    await db.submission.create({
      data: {
        date: new Date(),
        motivationLetter: Buffer.from(motvationLetterFile),
        resume: resumeFile ? Buffer.from(resumeFile) : student.resume,
        studentId: session?.user.id,
        offerId,
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

export const removeSubmission = async ({
  id,
}: {
  id: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    const submission = await db.submission.findUnique({
      where: { id },
      select: { studentId: true, status: true },
    });
    if (
      !submission ||
      !session ||
      session.user.id !== submission.studentId ||
      submission.status !== "Waiting"
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      };
    }

    await db.submission.delete({
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

export const rejectSubmission = async ({
  id,
}: {
  id: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    const submission = await db.submission.findUnique({
      where: { id },
      select: { offer: { select: { companyId: true } } },
    });
    if (
      !submission ||
      !session ||
      session.user.id !== submission.offer.companyId
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      };
    }

    await db.submission.update({
      where: { id },
      data: { status: "Rejected" },
    });

    return {
      success: true,
      message: "Candidature refusée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const acceptSubmission = async ({
  id,
}: {
  id: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    const submission = await db.submission.findUnique({
      where: { id },
      select: { offerId: true, offer: { select: { companyId: true } } },
    });
    if (
      !submission ||
      !session ||
      session.user.id !== submission.offer.companyId
    ) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      };
    }

    await db.submission.update({
      where: { id },
      data: { status: "Accepted" },
    });

    await db.submission.updateMany({
      where: {
        status: "Waiting",
        offerId: submission.offerId,
      },
      data: { status: "Rejected" },
    });

    await db.offer.update({
      where: { id: submission.offerId },
      data: { status: "Completed" },
    });

    return {
      success: true,
      message: "Candidature acceptée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};
