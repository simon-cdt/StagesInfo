export type Etudiant = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  competences: string;
  cv: Uint8Array;
  role: "etudiant";
};

export type Entreprise = {
  id: string;
  email: string;
  nom: string;
  adresse: string;
  contact: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
  };
  secteurs: {
    secteur: {
      id: string;
      valeur: string;
      label: string;
    };
  }[];
  role: "entreprise";
};

export type Admin = {
  id: string;
  email: string;
  mdp: string;
  role: "admin";
};

export type FetchSecteursList = [
  {
    id: string;
    label: string;
    valeur: string;
  },
];
