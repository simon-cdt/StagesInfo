import NextAuth from "next-auth";
import { Role } from "./types";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  interface Session {
    user: User & { id: string; role: Role };
    token: {
      id: string;
      role: Role;
    };
  }
}
