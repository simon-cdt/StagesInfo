"use server";

import { db } from "../db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import * as argon2 from "argon2";

export const updatePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "Le mot de passe a été modifé avec succès" }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role || !session.user.id) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const role = session.user.role;
    const id = session.user.id;

    if (role === "student") {
      const student = await db.student.findUnique({
        where: { id },
        select: { password: true },
      });
      if (!student) {
        return {
          success: false,
          message: "L'utilisateur n'existe pas",
        };
      }

      const isPasswordValid = await argon2.verify(
        student.password,
        currentPassword,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Le mot de passe actuel est incorrect",
        };
      }

      const newPassHashed = await argon2.hash(newPassword);

      await db.student.update({
        where: { id },
        data: {
          password: newPassHashed,
        },
      });

      return {
        success: true,
        message: "Le mot de passe a été modifé avec succès",
      };
    } else if (role === "company") {
      const company = await db.company.findUnique({
        where: { id },
        select: { password: true },
      });
      if (!company) {
        return {
          success: false,
          message: "L'utilisateur n'existe pas",
        };
      }

      const isValidPassword = await argon2.verify(
        company.password,
        currentPassword,
      );
      if (!isValidPassword) {
        return {
          success: false,
          message: "Le mot de passe actuel est incorrect",
        };
      }

      const newPassHashed = await argon2.hash(newPassword);

      await db.company.update({
        where: { id },
        data: {
          password: newPassHashed,
        },
      });

      return {
        success: true,
        message: "Le mot de passe a été modifé avec succès",
      };
    } else if (role === "admin") {
      const admin = await db.admin.findUnique({
        where: { id },
        select: { password: true },
      });
      if (!admin) {
        return {
          success: false,
          message: "L'utilisateur n'existe pas",
        };
      }

      const isValidPassword = await argon2.verify(
        admin.password,
        currentPassword,
      );
      if (!isValidPassword) {
        return {
          success: false,
          message: "Le mot de passe actuel est incorrect",
        };
      }

      const newPassHashed = await argon2.hash(newPassword);

      await db.admin.update({
        where: { id },
        data: {
          password: newPassHashed,
        },
      });

      return {
        success: true,
        message: "Le mot de passe a été modifé avec succès",
      };
    } else {
      return {
        success: false,
        message: "Une erreur est survenue",
      };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
