// eslint-disable-next-line
import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "etudiant" | "entreprise";
      nom?: string;
      prenom?: string;
      adresse?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: "admin" | "etudiant" | "entreprise";
    nom?: string;
    prenom?: string;
    adresse?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown> {
    id: string;
    email: string;
    role: "admin" | "etudiant" | "entreprise";
    nom?: string;
    prenom?: string;
    adresse?: string;
  }
}
