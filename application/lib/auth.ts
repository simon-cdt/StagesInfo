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
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("L'email et le mot de passe sont requis");
        }

        const student = await db.student.findUnique({
          where: { email: credentials?.email },
        });
        if (student) {
          if (await argon2.verify(student.password, credentials.password)) {
            return {
              id: student.id,
              role: "student",
            };
          } else {
            throw new Error("Mot de passe incorrect");
          }
        }

        const company = await db.company.findUnique({
          where: { email: credentials?.email },
        });
        if (company) {
          if (await argon2.verify(company.password, credentials.password)) {
            return {
              id: company.id,
              role: "company",
            };
          } else {
            throw new Error("Mot de passe incorrect");
          }
        }

        const admin = await db.admin.findUnique({
          where: { email: credentials?.email },
        });
        if (admin) {
          if (await argon2.verify(admin.password, credentials.password)) {
            return {
              id: admin.id,
              role: "admin",
            };
          } else {
            throw new Error("Mot de passe incorrect");
          }
        }

        throw new Error("Aucun utilisateur trouvé avec cet email");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
  },
};
