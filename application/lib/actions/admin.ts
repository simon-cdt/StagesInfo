"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { db } from "../db";
import * as argon2 from "argon2";

export const updateEtudiant = async ({
  etudiant,
}: {
  etudiant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string[] | undefined;
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

    const user = await db.etudiant.findUnique({
      where: {
        id: etudiant.id,
      },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        message: "L'étudiant n'existe pas.",
      };
    }

    await db.etudiant.update({
      where: {
        id: etudiant.id,
      },
      data: {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        competences: etudiant.competences ? etudiant.competences.join(",") : "",
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

export const updateEtudiantPassword = async ({
  etudiant,
}: {
  etudiant: {
    id: string;
    mdp: string;
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

    const user = await db.etudiant.findUnique({
      where: {
        id: etudiant.id,
      },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        message: "L'étudiant n'existe pas.",
      };
    }

    const mdpHash = await argon2.hash(etudiant.mdp);

    await db.etudiant.update({
      where: {
        id: etudiant.id,
      },
      data: {
        mdp: mdpHash,
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

export const deleteEtudiant = async ({
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

    const etudiant = await db.etudiant.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        candidatures: {
          select: {
            statut: true,
          },
        },
      },
    });

    if (!etudiant) {
      return {
        success: false,
        message: "L'étudiant n'existe pas.",
      };
    }

    if (
      etudiant.candidatures.some(
        (candidature) => candidature.statut === "Acceptée",
      )
    ) {
      return {
        success: false,
        message:
          "Vous ne pouvez pas supprimer cet étudiant car il a au moins une candidature acceptée.",
      };
    }

    await db.candidature.deleteMany({
      where: {
        etudiantId: id,
      },
    });

    await db.etudiant.delete({
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
