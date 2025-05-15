"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import * as argon2 from "argon2";

export const getStudentSession = async ({
  id,
}: {
  id: string;
}): Promise<
  | { success: false; message: "Vous n'êtes pas connecté." }
  | {
      success: true;
      student: {
        name: string;
        firstName: string;
        email: string;
        skills: string;
      };
    }
> => {
  const student = await db.student.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      firstName: true,
      email: true,
      skills: true,
    },
  });
  if (!student) {
    return { success: false, message: "Vous n'êtes pas connecté." };
  }

  return {
    success: true,
    student: {
      name: student.name,
      firstName: student.firstName,
      email: student.email,
      skills: student.skills,
    },
  };
};

export const createStudent = async ({
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

export const updateStudent = async ({
  name,
  firstName,
  email,
  skills,
  resume,
}: {
  name: string;
  firstName: string;
  email: string;
  skills: string;
  resume: File | undefined;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Informations modifiées avec succès." }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }

    const student = await db.student.findUnique({
      where: {
        id: session.user.id,
      },
      select: { id: true, resume: true },
    });
    if (!student) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }

    const emailExist = await db.student.findUnique({
      where: {
        email: email,
      },
      select: { id: true },
    });
    if (emailExist && emailExist.id !== student.id) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    let newResume: Buffer | undefined;
    if (typeof resume !== "undefined") {
      if (!(resume instanceof File)) {
        return { success: false, message: "Le fichier CV est invalide." };
      }
      const arrayBuffer = await resume.arrayBuffer();
      newResume = Buffer.from(arrayBuffer);
    }

    await db.student.update({
      where: {
        id: student.id,
      },
      data: {
        name,
        firstName,
        email: email,
        skills,
        resume: newResume ?? student.resume,
      },
    });

    return { success: true, message: "Informations modifiées avec succès." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue." };
  }
};
