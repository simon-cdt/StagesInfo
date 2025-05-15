"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as argon2 from "argon2";

export const updateStudentAdmin = async ({
  student,
}: {
  student: {
    id: string;
    name: string;
    firstName: string;
    email: string;
    skills: string[] | undefined;
  };
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const studentRecord = await db.student.findUnique({
      where: {
        id: student.id,
      },
      select: { id: true },
    });

    if (!studentRecord) {
      return {
        success: false,
        message: "L'étudiant n'existe pas.",
      };
    }

    await db.student.update({
      where: {
        id: student.id,
      },
      data: {
        name: student.name,
        firstName: student.firstName,
        email: student.email,
        skills: student.skills ? student.skills.join(",") : "",
      },
    });

    return {
      success: true,
      message: "L'étudiant a été mis à jour avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const updateStudentPasswordAdmin = async ({
  student,
}: {
  student: {
    id: string;
    password: string;
  };
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const studentRecord = await db.student.findUnique({
      where: {
        id: student.id,
      },
      select: { id: true },
    });

    if (!studentRecord) {
      return {
        success: false,
        message: "L'étudiant n'existe pas.",
      };
    }

    const passwordHash = await argon2.hash(student.password);

    await db.student.update({
      where: {
        id: student.id,
      },
      data: {
        password: passwordHash,
      },
    });

    return {
      success: true,
      message: "Le mot de passe a été mis à jour avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const deleteStudentAdmin = async ({
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

    const student = await db.student.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        submissions: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!student) {
      return {
        success: false,
        message: "L'étudiant n'existe pas.",
      };
    }

    if (
      student.submissions.some((submission) => submission.status === "Accepted")
    ) {
      return {
        success: false,
        message:
          "Vous ne pouvez pas supprimer cet étudiant car il a au moins une candidature acceptée.",
      };
    }

    await db.submission.deleteMany({
      where: {
        studentId: id,
      },
    });

    await db.student.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "L'étudiant a été supprimé avec succès.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue.",
    };
  }
};

export const createStudentAdmin = async ({
  name,
  firstName,
  email,
  password,
  skills,
  resume,
}: {
  name: string;
  firstName: string;
  email: string;
  password: string;
  skills: string;
  resume: File;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Compte créé avec succès." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'avez pas les autorisations nécessaires.",
      };
    }

    const student = await db.student.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (student) {
      return { success: false, message: "L'e-mail est déjà utilisé." };
    }

    const passwordHash = await argon2.hash(password);
    const arrayBuffer = await resume.arrayBuffer();
    const newResume = Buffer.from(arrayBuffer);

    await db.student.create({
      data: {
        name,
        firstName,
        email,
        password: passwordHash,
        skills: skills.toString(),
        resume: newResume,
      },
    });

    return { success: true, message: "Compte créé avec succès." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};
