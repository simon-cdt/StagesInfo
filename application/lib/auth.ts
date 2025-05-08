import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import * as argon2 from "argon2";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        // Check in Admin
        const admin = await db.admin.findUnique({ where: { email } });
        if (admin) {
          const validPassword = await argon2.verify(admin.mdp, password);
          if (!validPassword) {
            throw new Error("Le mot de passe est incorrect.");
          } else {
            return {
              id: admin.id,
              email: admin.email,
              role: "admin",
            };
          }
        }

        // Check in Etudiant
        const etudiant = await db.etudiant.findUnique({ where: { email } });
        if (etudiant) {
          const validPassword = await argon2.verify(etudiant.mdp, password);
          if (!validPassword) {
            throw new Error("Le mot de passe est incorrect.");
          } else {
            return {
              id: etudiant.id,
              email: etudiant.email,
              role: "etudiant",
              nom: etudiant.nom,
              prenom: etudiant.prenom,
            };
          }
        }

        // Check in Entreprise
        const entreprise = await db.entreprise.findUnique({ where: { email } });
        if (entreprise) {
          const validPassword = await argon2.verify(entreprise.mdp, password);
          if (!validPassword) {
            throw new Error("Le mot de passe est incorrect.");
          } else {
            return {
              id: entreprise.id,
              email: entreprise.email,
              role: "entreprise",
              nom: entreprise.nom,
              adresse: entreprise.adresse,
            };
          }
        }

        throw new Error("L'email ne correspond à aucun utilisateur.");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.nom = user.nom;
        token.prenom = user.prenom;
        token.adresse = user.adresse;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.nom = token.nom;
      session.user.prenom = token.prenom;
      session.user.adresse = token.adresse;
      return session;
    },
  },
};
