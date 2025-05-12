"use server";

import { db } from "../db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import * as argon2 from "argon2";

export const updatePassword = async ({
  mdpActuel,
  nvMdp,
}: {
  mdpActuel: string;
  nvMdp: string;
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

    if (role === "etudiant") {
      const etudiant = await db.etudiant.findUnique({
        where: { id },
        select: { mdp: true },
      });
      if (!etudiant) {
        return {
          success: false,
          message: "L'utilisateur n'existe pas",
        };
      }

      const verifyPassword = await argon2.verify(etudiant.mdp, mdpActuel);
      if (!verifyPassword) {
        return {
          success: false,
          message: "Le mot de passe actuel est incorrect",
        };
      }

      const newPassHashed = await argon2.hash(nvMdp);

      await db.etudiant.update({
        where: { id },
        data: {
          mdp: newPassHashed,
        },
      });

      return {
        success: true,
        message: "Le mot de passe a été modifé avec succès",
      };
    } else if (role === "entreprise") {
      const entreprise = await db.entreprise.findUnique({
        where: { id },
        select: { mdp: true },
      });
      if (!entreprise) {
        return {
          success: false,
          message: "L'utilisateur n'existe pas",
        };
      }

      const verifyPassword = await argon2.verify(entreprise.mdp, mdpActuel);
      if (!verifyPassword) {
        return {
          success: false,
          message: "Le mot de passe actuel est incorrect",
        };
      }

      const newPassHashed = await argon2.hash(nvMdp);

      await db.entreprise.update({
        where: { id },
        data: {
          mdp: newPassHashed,
        },
      });

      return {
        success: true,
        message: "Le mot de passe a été modifé avec succès",
      };
    } else if (role === "admin") {
      const admin = await db.admin.findUnique({
        where: { id },
        select: { mdp: true },
      });
      if (!admin) {
        return {
          success: false,
          message: "L'utilisateur n'existe pas",
        };
      }

      const verifyPassword = await argon2.verify(admin.mdp, mdpActuel);
      if (!verifyPassword) {
        return {
          success: false,
          message: "Le mot de passe actuel est incorrect",
        };
      }

      const newPassHashed = await argon2.hash(nvMdp);

      await db.admin.update({
        where: { id },
        data: {
          mdp: newPassHashed,
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
