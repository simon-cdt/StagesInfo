import { CandidatureStatut, StageStatut } from "@prisma/client";

export type Role = "etudiant" | "entreprise" | "admin";

export type FetchSecteursList = [
  {
    id: string;
    label: string;
    valeur: string;
  },
];

export type FetchStages = [
  {
    id: string;
    titre: string;
    entreprise: {
      nom: string;
    };
    secteur: {
      label: string;
      couleur: string;
    };
    duree: string;
    dateDebut: string;
    dateFin: string;
    lieu: string;
  },
];

export type FetchStageDetails = {
  stage: {
    id: string;
    secteur: {
      label: string;
      couleur: string;
    };
    titre: string;
    statut: StageStatut;
    lieu: string;
    duree: string;
    dateDebut: string;
    dateFin: string;
    description: string;
    competences: string;
    entreprise: {
      nom: string;
      adresse: string;
      email: string;
      contact: {
        nom: string;
        prenom: string;
        email: string;
      };
    };
  };
  expiree: boolean;
  alreadyPosted: boolean;
};

export type FetchInfoEtudiant = {
  nom: string;
  prenom: string;
  email: string;
  cv: Uint8Array<ArrayBufferLike>;
  competences: string;
};

export type FetchCandidatures = [
  {
    id: string;
    date: Date;
    statut: CandidatureStatut;
    stage: {
      id: string;
      titre: string;
      statut: StageStatut;
      entreprise: {
        nom: string;
      };
    };
  },
];

export type FetchEvaluations = [
  {
    id: string;
    evaluation: {
      note: 4;
      date: Date;
      commentaire: string;
    } | null;
    titre: string;
    entreprise: {
      nom: string;
      contact: {
        nom: string;
        prenom: string;
        email: string;
      };
    };
  },
];

export type FetchOffresEntreprise = [
  {
    id: string;
    titre: string;
    description: string;
    secteur: {
      id: string;
      couleur: string;
      label: string;
    };
    duree: string;
    dateDebut: Date;
    dateFin: Date;
    lieu: string;
    statut: StageStatut;
    competences: string;
  },
];

export type FetchCandidaturesRecues = [
  {
    id: string;
    etudiant: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      competences: string;
    };
    date: Date;
    statut: CandidatureStatut;
    stage: {
      statut: StageStatut;
      dateFin: Date;
    };
    disable: boolean;
  },
];

export type FetchEvaluationEntreprise = [
  {
    id: string;
    etudiant: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };
    stage: {
      id: string;
      titre: string;
      evaluation: {
        id: string;
        note: number;
        commentaire: string;
        date: Date;
      } | null;
    };
  },
];

// eslint-disable-next-line
export const colorMap: any = {
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  green: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  lime: {
    border: "border-lime-200",
    bg: "bg-lime-50",
    text: "text-lime-700",
  },
  purple: {
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  orange: {
    border: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  pink: {
    border: "border-pink-200",
    bg: "bg-pink-50",
    text: "text-pink-700",
  },
  cyan: {
    border: "border-cyan-200",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  teal: {
    border: "border-teal-200",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
};
