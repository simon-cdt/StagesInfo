"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <header className="flex h-32 w-screen items-center">
      {session ? (
        <div className="flex w-full items-center">
          <div className="flex w-[30%] justify-center">
            <Link href={"/"} className="h-[60%]">
              <Image
                src={"/logo/logo.svg"}
                alt="Logo"
                width={500}
                height={500}
                className="h-20"
              />
            </Link>
          </div>
          <div className="flex w-[40%] justify-evenly">
            <Link href={"/"} className="text-xl font-bold">
              Rechercher des stages
            </Link>
            {session.user.role === "etudiant" ? (
              <Link href={"/student"} className="text-xl font-bold">
                Espace étudiant
              </Link>
            ) : session.user.role === "admin" ? (
              <Link href={"/admin"} className="text-xl font-bold">
                Espace administrateur
              </Link>
            ) : (
              session.user.role === "entreprise" && (
                <Link href={"/entreprise"} className="text-xl font-bold">
                  Espace entreprise
                </Link>
              )
            )}
          </div>
          <div className="flex w-[30%] justify-center">
            <Button
              onClick={async () => {
                await signOut({ redirect: false });
                router.push("/login");
              }}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center">
          <div className="flex w-[50%] justify-center">
            <Link href={"/"} className="h-[60%]">
              <Image
                src={"/logo/logo.svg"}
                alt="Logo"
                width={500}
                height={500}
                className="h-20"
              />
            </Link>
          </div>
          <div className="flex w-[50%] justify-center">
            <Link href={"/login"}>
              <Button>S&apos;identifier</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
