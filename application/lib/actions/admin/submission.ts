"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export const updateSubmissionAdmin = async ({
  id,
  resume,
  motivationLetter,
}: {
  id: string;
  resume: File | undefined;
  motivationLetter: File | undefined;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const submission = await db.submission.findUnique({
      where: {
        id,
      },
      select: { id: true, resume: true, motivationLetter: true },
    });

    if (!submission) {
      return {
        success: false,
        message: "La candidature n'existe pas.",
      };
    }

    const motvationLetterFile =
      motivationLetter && (await motivationLetter.arrayBuffer());
    const resumeFile = resume && (await resume.arrayBuffer());

    await db.submission.update({
      where: {
        id,
      },
      data: {
        resume: resumeFile ? Buffer.from(resumeFile) : submission.resume,
        motivationLetter: motvationLetterFile
          ? Buffer.from(motvationLetterFile)
          : submission.motivationLetter,
      },
    });

    return {
      success: true,
      message: "La candidature a été mise à jour avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const deleteSubmissionAdmin = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const submission = await db.submission.findUnique({
      where: {
        id,
      },
    });

    if (!submission) {
      return {
        success: false,
        message: "La candidature n'existe pas.",
      };
    }

    await db.submission.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "La candidature a été supprimée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const createSubmissionAdmin = async ({
  studentId,
  offerId,
  resume,
  motivationLetter,
}: {
  studentId: string;
  offerId: string;
  resume: File | undefined;
  motivationLetter: File;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const motvationLetterFile = await motivationLetter.arrayBuffer();
    const resumeFile = resume && (await resume.arrayBuffer());

    const offer = await db.offer.findUnique({
      where: {
        id: offerId,
      },
      select: {
        id: true,
        status: true,
        submissions: { select: { studentId: true } },
      },
    });

    const student = await db.student.findUnique({
      where: {
        id: studentId,
      },
      select: { id: true, resume: true },
    });

    if (!student || !offer) {
      return {
        success: false,
        message: "L'étudiant ou l'offre n'existe pas.",
      };
    }

    if (offer.status !== "Available") {
      return {
        success: false,
        message: "L'offre n'est plus disponible.",
      };
    }

    if (
      offer?.submissions.some(
        (submission) => submission.studentId === studentId,
      )
    ) {
      return {
        success: false,
        message: "L'étudiant a déjà postulé à cette offre.",
      };
    }

    await db.submission.create({
      data: {
        studentId,
        offerId,
        resume: resumeFile ? Buffer.from(resumeFile) : student?.resume,
        motivationLetter: Buffer.from(motvationLetterFile),
        date: new Date(),
      },
    });

    return {
      success: true,
      message: "La candidature a été créée avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const rejectSubmissionAdmin = async ({
  id,
}: {
  id: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const submission = await db.submission.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!submission) {
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

export const acceptSubmissionAdmin = async ({
  id,
}: {
  id: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const submission = await db.submission.findUnique({
      where: { id },
      select: { offerId: true },
    });
    if (!submission) {
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
