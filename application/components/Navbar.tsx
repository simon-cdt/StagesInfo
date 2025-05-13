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
                className="h-14"
              />
            </Link>
          </div>
          <div className="flex w-[40%] items-center justify-evenly">
            <Link href={"/"} className="text-xl font-bold hover:underline">
              Rechercher des stages
            </Link>
            {session.user.role === "etudiant" ? (
              <Link
                href={"/etudiant"}
                className="text-xl font-bold hover:underline"
              >
                Espace étudiant
              </Link>
            ) : session.user.role === "admin" ? (
              <Link
                href={"/admin"}
                className="text-xl font-bold hover:underline"
              >
                Espace administrateur
              </Link>
            ) : (
              session.user.role === "entreprise" && (
                <Link
                  href={"/entreprise"}
                  className="text-xl font-bold hover:underline"
                >
                  Espace entreprise
                </Link>
              )
            )}
          </div>
          <div className="flex w-[30%] justify-center gap-7">
            <Link href={"/compte"}>
              <Button size={"icon"} variant={"ghost"}>
                <Image
                  src={"/icon/user.svg"}
                  alt="Icon"
                  width={700}
                  height={700}
                  className="w-7"
                />
              </Button>
            </Link>
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
