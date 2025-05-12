"use server";
import { getServerSession } from "next-auth";
import { db } from "../db";
import * as argon2 from "argon2";
import { authOptions } from "../auth";

export const createEntreprise = async ({
  nom,
  adresse,
  email,
  mdp,
  contactNom,
  contactPrenom,
  contactEmail,
  secteurs,
}: {
  nom: string;
  adresse: string;
  email: string;
  mdp: string;
  contactNom: string;
  contactPrenom: string;
  contactEmail: string;
  secteurs: string[];
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "L'entreprise a été crée avec succès" }
> => {
  try {
    const entrepriseExiste = await db.entreprise.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (entrepriseExiste) {
      return { success: false, message: "L'email est déjà utilisé" };
    }

    const mdpHashe = await argon2.hash(mdp);

    await db.entreprise.create({
      data: {
        nom,
        email,
        mdp: mdpHashe,
        adresse,
        contact: {
          create: {
            nom: contactNom,
            prenom: contactPrenom,
            email: contactEmail,
          },
        },
        secteurs: {
          createMany: {
            data: secteurs.map((id: string) => ({ idSecteur: id })),
          },
        },
      },
    });
    return { success: true, message: "L'entreprise a été crée avec succès" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const getEntrepriseSession = async ({
  id,
}: {
  id: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      entreprise: {
        nom: string;
        adresse: string;
        email: string;
      };
      secteurs: {
        id: string;
        label: string;
        checked: boolean;
      }[];
    }
> => {
  try {
    const user = await db.entreprise.findUnique({
      where: {
        id,
      },
      select: {
        nom: true,
        adresse: true,
        email: true,
        secteurs: {
          select: {
            secteur: {
              select: {
                id: true,
                label: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }

    const allSecteurs = await db.secteur.findMany({
      select: { id: true, label: true },
    });

    const secteurs: {
      id: string;
      label: string;
      checked: boolean;
    }[] = [];

    allSecteurs.forEach((secteur) => {
      if (
        user.secteurs.some(
          (userSecteur) => userSecteur.secteur.id === secteur.id,
        )
      ) {
        secteurs.push({
          id: secteur.id,
          label: secteur.label,
          checked: true,
        });
      } else {
        secteurs.push({
          id: secteur.id,
          label: secteur.label,
          checked: false,
        });
      }
    });

    return {
      success: true,
      entreprise: {
        nom: user.nom,
        adresse: user.adresse,
        email: user.email,
      },
      secteurs,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const modifierEntreprise = async ({
  nom,
  email,
  adresse,
  secteurs,
}: {
  nom: string;
  email: string;
  adresse: string;
  secteurs: string[];
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const entreprise = await db.entreprise.findUnique({
      where: {
        id: session.user.id,
      },
      select: { id: true },
    });
    if (!entreprise) {
      return {
        success: false,
        message: "Le compte n'existe pas",
      };
    }

    const emailExist = await db.entreprise.findUnique({
      where: {
        email: email,
      },
      select: { id: true },
    });
    if (emailExist && emailExist.id !== entreprise.id) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    await db.entreprise.update({
      where: { id: entreprise.id },
      data: {
        nom,
        email,
        adresse,
        secteurs: {
          deleteMany: {
            idEntreprise: entreprise.id,
          },
          createMany: {
            data: secteurs.map((id: string) => ({ idSecteur: id })),
          },
        },
      },
    });

    return { success: true, message: "L'entreprise a bien été modifée" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const getEntrepriseContactSession = async ({
  id,
}: {
  id: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      entrepriseContact: {
        nom: string;
        email: string;
        prenom: string;
      };
    }
> => {
  try {
    const entreprise = await db.entreprise.findUnique({
      where: { id },
      select: {
        contact: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    const contact = entreprise?.contact;

    if (!contact) {
      return { success: false, message: "Le contact n'existe pas" };
    }

    return { success: true, entrepriseContact: contact };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const modifierContactEntreprise = async ({
  nom,
  prenom,
  email,
}: {
  nom: string;
  prenom: string;
  email: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const entreprise = await db.entreprise.findUnique({
      where: {
        id: session.user.id,
      },
      select: { contact: { select: { id: true } } },
    });
    if (!entreprise?.contact?.id) {
      return { success: false, message: "Le contact n'existe pas" };
    }

    await db.contact.update({
      where: { id: entreprise.contact.id },
      data: {
        nom,
        prenom,
        email,
      },
    });

    return {
      success: true,
      message: "Le contact de l'entreprise a bien été mis à jour",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};
