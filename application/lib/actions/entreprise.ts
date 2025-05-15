"use server";
import { getServerSession } from "next-auth";
import { db } from "../db";
import * as argon2 from "argon2";
import { authOptions } from "../auth";

export const getEntrepriseSession = async ({
  id,
}: {
  id: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      company: {
        name: string;
        address: string;
        email: string;
      };
      sectors: {
        id: string;
        label: string;
        checked: boolean;
      }[];
    }
> => {
  try {
    const company = await db.company.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        address: true,
        email: true,
        sectors: {
          select: {
            sector: {
              select: {
                id: true,
                label: true,
              },
            },
          },
        },
      },
    });
    if (!company) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }

    const sectorsDB = await db.sector.findMany({
      select: { id: true, label: true },
    });

    const sectors: {
      id: string;
      label: string;
      checked: boolean;
    }[] = [];

    sectorsDB.forEach((secteur) => {
      if (
        company.sectors.some(
          (companySector) => companySector.sector.id === secteur.id,
        )
      ) {
        sectors.push({
          id: secteur.id,
          label: secteur.label,
          checked: true,
        });
      } else {
        sectors.push({
          id: secteur.id,
          label: secteur.label,
          checked: false,
        });
      }
    });

    return {
      success: true,
      company: {
        name: company.name,
        address: company.address,
        email: company.email,
      },
      sectors,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const createCompany = async ({
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
        email,
        password: passwordHash,
        address,
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

export const updateCompany = async ({
  name,
  email,
  address,
  sectors,
}: {
  name: string;
  email: string;
  address: string;
  sectors: string[];
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action",
      };
    }
    const company = await db.company.findUnique({
      where: {
        id: session.user.id,
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
      where: { id: company.id },
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

export const getCompanyContactSession = async ({
  id,
}: {
  id: string;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      entrepriseContact: {
        name: string;
        email: string;
        firstName: string;
      };
    }
> => {
  try {
    const company = await db.company.findUnique({
      where: { id },
      select: {
        contact: {
          select: {
            name: true,
            firstName: true,
            email: true,
          },
        },
      },
    });

    const contact = company?.contact;

    if (!contact) {
      return { success: false, message: "Le contact n'existe pas" };
    }

    return { success: true, entrepriseContact: contact };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Une erreur est survenue" };
  }
};

export const updateCompanyContact = async ({
  name,
  firstName,
  email,
}: {
  name: string;
  firstName: string;
  email: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const company = await db.company.findUnique({
      where: {
        id: session.user.id,
      },
      select: { contact: { select: { id: true } } },
    });
    if (!company?.contact?.id) {
      return { success: false, message: "Le contact n'existe pas" };
    }

    await db.contact.update({
      where: { id: company.contact.id },
      data: {
        name,
        firstName,
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

export const updateOffer = async ({
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
    if (!session) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const offer = await db.offer.findUnique({
      where: {
        id,
      },
      select: { companyId: true, status: true },
    });
    if (
      !offer ||
      offer.companyId !== session.user.id ||
      offer.status !== "Available"
    ) {
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
        location,
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

export const deleteOffer = async ({
  id,
}: {
  id: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Vous n'êtes pas connecté." };
    }
    const offer = await db.offer.findUnique({
      where: {
        id,
      },
      select: { companyId: true, status: true },
    });
    if (
      !offer ||
      offer.companyId !== session.user.id ||
      offer.status !== "Available"
    ) {
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

export const createOffer = async ({
  title,
  description,
  duration,
  startDate,
  endDate,
  location,
  skills,
  sectorId,
}: {
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
    if (!session || session.user.role !== "company") {
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
        sectorId,
        companyId: session.user.id,
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
