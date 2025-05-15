"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as argon2 from "argon2";

export const updateCompanyAdmin = async ({
  id,
  name,
  email,
  address,
  sectors,
}: {
  id: string;
  name: string;
  email: string;
  address: string;
  sectors: string[];
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const company = await db.company.findUnique({
      where: {
        id,
      },
      select: { id: true },
    });
    if (!company) {
      return {
        success: false,
        message: "Le compte n'existe pas",
      };
    }

    const emailExist = await db.company.findUnique({
      where: {
        email: email,
      },
      select: { id: true },
    });
    if (emailExist && emailExist.id !== company.id) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    await db.company.update({
      where: { id },
      data: {
        name,
        email,
        address,
        sectors: {
          deleteMany: {
            idCompany: company.id,
          },
          createMany: {
            data: sectors.map((id: string) => ({ idSector: id })),
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

export const updateCompanyContactAdmin = async ({
  id,
  name,
  firstName,
  email,
}: {
  id: string;
  name: string;
  firstName: string;
  email: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const contact = await db.contact.findUnique({
      where: {
        id,
      },
      select: { id: true },
    });
    if (!contact) {
      return {
        success: false,
        message: "Le compte n'existe pas",
      };
    }

    await db.contact.update({
      where: { id },
      data: {
        name,
        firstName,
        email,
      },
    });

    return { success: true, message: "Le contact a bien été modifié" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updateCompanyPasswordAdmin = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const company = await db.company.findUnique({
      where: {
        id,
      },
      select: { id: true },
    });
    if (!company) {
      return {
        success: false,
        message: "Le compte n'existe pas",
      };
    }

    const passwordHash = await argon2.hash(password);

    await db.company.update({
      where: { id },
      data: {
        password: passwordHash,
      },
    });

    return { success: true, message: "Le mot de passe a bien été modifié" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const deleteCompanyAdmin = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const company = await db.company.findUnique({
      where: {
        id,
      },
      select: { id: true },
    });
    if (!company) {
      return {
        success: false,
        message: "Le compte n'existe pas",
      };
    }

    await db.submission.deleteMany({
      where: {
        offer: {
          companyId: id,
        },
      },
    });

    await db.offer.deleteMany({
      where: {
        companyId: id,
      },
    });

    await db.sectorCompany.deleteMany({
      where: {
        idCompany: id,
      },
    });

    await db.company.delete({
      where: {
        id,
      },
    });

    await db.contact.deleteMany({
      where: {
        company: {
          id: id,
        },
      },
    });

    return { success: true, message: "L'entreprise a bien été supprimée" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const createCompanyAdmin = async ({
  name,
  address,
  email,
  password,
  contactName,
  contactFirstName,
  contactEmail,
  sectors,
}: {
  name: string;
  address: string;
  email: string;
  password: string;
  contactName: string;
  contactFirstName: string;
  contactEmail: string;
  sectors: string[];
}): Promise<
  | { success: false; message: string }
  | { success: true; message: "L'entreprise a été crée avec succès" }
> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }

    const company = await db.company.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (company) {
      return { success: false, message: "L'email est déjà utilisé" };
    }

    const passwordHash = await argon2.hash(password);

    await db.company.create({
      data: {
        name,
        address,
        email,
        password: passwordHash,
        contact: {
          create: {
            name: contactName,
            firstName: contactFirstName,
            email: contactEmail,
          },
        },
        sectors: {
          createMany: {
            data: sectors.map((id: string) => ({ idSector: id })),
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
