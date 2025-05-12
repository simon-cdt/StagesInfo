import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const secteurs = [
    {
      label: "Informatique",
      couleur: "blue",
    },
    {
      label: "Réseau",
      couleur: "green",
    },
    {
      label: "Développement",
      couleur: "red",
    },
    {
      label: "Data Science",
      couleur: "purple",
    },
    {
      label: "DevOps",
      couleur: "orange",
    },
    {
      label: "Mobile",
      couleur: "pink",
    },
    {
      label: "Web",
      couleur: "cyan",
    },
    {
      label: "IA",
      couleur: "teal",
    },
    {
      label: "Consulting",
      couleur: "lime",
    },
  ];

  const stages = [
    {
      titre: "Développeur Fullstack",
      description: "Stage de développement fullstack avec Node.js et React.",
      competences: "Node.js,React,TypeScript",
      duree: "1 an et demi",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Paris",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkow0000ucpkb11pjqs1",
    },
    {
      titre: "Développeur Backend",
      description: "Stage de développement backend avec Node.js et Express.",
      competences: "Node.js,Express,TypeScript",
      duree: "6 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Lyon",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkow0000ucpkb11pjqs1",
    },
    {
      titre: "Développeur Frontend",
      description: "Stage de développement frontend avec React et Redux.",
      competences: "React,Redux,JavaScript",
      duree: "4 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Marseille",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkqe0004ucpkla21l2ux",
    },
    {
      titre: "Data Scientist",
      description: "Stage en science des données avec Python et TensorFlow.",
      competences: "Python,TensorFlow,Data Analysis",
      duree: "1 an",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Toulouse",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkqe0004ucpkla21l2ux",
    },
    {
      titre: "Ingénieur DevOps",
      description: "Stage en ingénierie DevOps avec Docker et Kubernetes.",
      competences: "Docker,Kubernetes,CI/CD",
      duree: "8 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Nantes",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkqe0004ucpkla21l2ux",
    },
    {
      titre: "Développeur Mobile",
      description: "Stage de développement mobile avec Flutter.",
      competences: "Flutter,Dart,Mobile Development",
      duree: "5 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Bordeaux",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkow0000ucpkb11pjqs1",
    },
    {
      titre: "Ingénieur QA",
      description: "Stage en assurance qualité avec Selenium.",
      competences: "Selenium,QA,Testing",
      duree: "3 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Strasbourg",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkqe0004ucpkla21l2ux",
    },
    {
      titre: "Analyste de données",
      description: "Stage d'analyse de données avec SQL et Excel.",
      competences: "SQL,Excel,Data Analysis",
      duree: "2 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Nice",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkow0000ucpkb11pjqs1",
    },
    {
      titre: "Développeur Web",
      description: "Stage de développement web avec HTML, CSS et JavaScript.",
      competences: "HTML,CSS,JavaScript",
      duree: "4 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Lille",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkow0000ucpkb11pjqs1",
    },
    {
      titre: "Ingénieur Réseau",
      description: "Stage en ingénierie réseau avec Cisco.",
      competences: "Cisco,Networking,Security",
      duree: "6 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Rennes",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkpu0002ucpknbs4vy7s",
    },
    {
      titre: "Développeur IA",
      description: "Stage de développement IA avec PyTorch.",
      competences: "PyTorch,Machine Learning,AI",
      duree: "1 an",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Montpellier",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkpu0002ucpknbs4vy7s",
    },
    {
      titre: "Consultant IT",
      description: "Stage de consultant IT avec SAP.",
      competences: "SAP,Consulting,IT Strategy",
      duree: "8 mois",
      dateDebut: new Date("2025-05-08"),
      dateFin: new Date("2025-06-07"),
      lieu: "Grenoble",
      entrepriseId: "cmaf3oz2100010cjuh8o06ifd",
      secteurId: "cmaf3pkpu0002ucpknbs4vy7s",
    },
  ];

  // for (const secteurData of secteurs) {
  //   await prisma.secteur.create({ data: secteurData });
  // }

  for (const stageData of stages) {
    await prisma.stage.create({ data: stageData });
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
