import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // const sectors = [
  //   {
  //     label: "Informatique",
  //     color: "blue",
  //   },
  //   {
  //     label: "Réseau",
  //     color: "green",
  //   },
  //   {
  //     label: "Développement",
  //     color: "red",
  //   },
  //   {
  //     label: "Data Science",
  //     color: "purple",
  //   },
  //   {
  //     label: "DevOps",
  //     color: "orange",
  //   },
  //   {
  //     label: "Mobile",
  //     color: "pink",
  //   },
  //   {
  //     label: "Web",
  //     color: "cyan",
  //   },
  //   {
  //     label: "IA",
  //     color: "teal",
  //   },
  //   {
  //     label: "Consulting",
  //     color: "lime",
  //   },
  // ];

  const companies = await prisma.company.findMany({
    select: {
      id: true,
    },
  });

  const sectors = await prisma.sector.findMany({
    select: {
      id: true,
    },
  });

  const offers = Array.from({ length: 100 }, (_, i) => {
    const randomCompany = Math.floor(Math.random() * companies.length);
    const randomSector = Math.floor(Math.random() * sectors.length);
    return {
      title: `Offre ${i + 1}`,
      description: `Description de l'offre ${i + 1}`,
      skills: "Skill1,Skill2,Skill3",
      duration: `${(i % 12) + 1} mois`,
      startDate: new Date(`2025-05-01`),
      endDate: new Date(`2025-06-01`),
      location: `Ville ${i + 1}`,
      companyId: companies[randomCompany].id,
      sectorId: sectors[randomSector].id,
    };
  });
  // const offers = [
  //   {
  //     title: "Développeur Fullstack",
  //     description: "Stage de développement fullstack avec Node.js et React.",
  //     skills: "Node.js,React,TypeScript",
  //     duration: "1 an et demi",
  //     startDate: new Date("2025-05-08"),
  //     endDate: new Date("2025-06-07"),
  //     location: "Paris",
  //     companyId: "cmaoegpur0000uc6c7p8c4u7r",
  //     sectorId: "cmaoefdi80000ucucslsb5jbt",
  //   },
  // ];

  // for (const sectorsData of sectors) {
  //   await prisma.sector.create({ data: sectorsData });
  // }

  for (const offer of offers) {
    await prisma.offer.create({ data: offer });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
