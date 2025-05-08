"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StudentRegisterForm from "@/components/form/register/student";
import CompanyRegisterForm from "@/components/form/register/company";
import Image from "next/image";

export default function InscriptionPage() {
  const [typeCompte, setTypeCompte] = useState<string | null>(null);
  const [etape, setEtape] = useState(1);

  const handleTypeCompteSelection = (type: string) => {
    setTypeCompte(type);
    setEtape(2);
  };

  return (
    <main className="flex w-full justify-center">
      {etape === 1 ? (
        <div className="flex flex-col gap-10 pt-20 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="mb-4 text-3xl font-bold">Créer un compte</h1>
            <p className="text-muted-foreground mb-8">
              Rejoignez StageConnect et accédez à toutes nos fonctionnalités
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <StudentEntreprise
              eleve
              handleTypeCompteSelection={handleTypeCompteSelection}
            />

            <StudentEntreprise
              eleve={false}
              handleTypeCompteSelection={handleTypeCompteSelection}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="text-primary hover:underline">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div>
          {typeCompte === "eleve" ? (
            <StudentRegisterForm setEtape={setEtape} />
          ) : (
            <CompanyRegisterForm setEtape={setEtape} />
          )}
        </div>
      )}
    </main>
  );
}

export const StudentEntreprise = ({
  handleTypeCompteSelection,
  eleve,
}: {
  handleTypeCompteSelection: (param: string) => void;
  eleve: boolean;
}) => {
  return (
    <Card
      className="hover:border-primary best-transition flex cursor-pointer flex-col gap-4"
      onClick={() => handleTypeCompteSelection(eleve ? "eleve" : "entreprise")}
    >
      <CardHeader className="flex w-full flex-col items-center gap-2">
        <div className="bg-primary/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full p-3">
          <Image
            src={`/icon/${eleve ? "graduation-cap" : "building"}.svg`}
            alt="Icon"
            width={700}
            height={700}
            className="text-primary h-8 w-8"
          />
        </div>

        <CardTitle>
          {eleve ? "Je suis un élève" : "Je suis une entreprise"}
        </CardTitle>
        <CardDescription>
          {eleve
            ? "Vous êtes étudiant et recherchez un stage"
            : "Vous souhaitez publier des offres de stage"}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
          <li className="flex items-center justify-center gap-2">
            {eleve ? (
              <>
                <Image
                  src={"/icon/check.svg"}
                  alt="icon"
                  height={700}
                  width={700}
                  className="w-4"
                />
                Accédez à des milliers d&apos;offres de stage
              </>
            ) : (
              <>
                <Image
                  src={"/icon/check.svg"}
                  alt="icon"
                  height={700}
                  width={700}
                  className="w-4"
                />
                Publiez vos offres de stage
              </>
            )}
          </li>
          <li className="flex items-center justify-center gap-2">
            {eleve ? (
              <>
                <Image
                  src={"/icon/check.svg"}
                  alt="icon"
                  height={700}
                  width={700}
                  className="w-4"
                />
                Postulez en quelques clics
              </>
            ) : (
              <>
                <Image
                  src={"/icon/check.svg"}
                  alt="icon"
                  height={700}
                  width={700}
                  className="w-4"
                />
                Gérez les candidatures reçues
              </>
            )}
          </li>
          <li className="flex items-center justify-center gap-2">
            {eleve ? (
              <>
                <Image
                  src={"/icon/check.svg"}
                  alt="icon"
                  height={700}
                  width={700}
                  className="w-4"
                />
                Suivez vos candidatures
              </>
            ) : (
              <>
                <Image
                  src={"/icon/check.svg"}
                  alt="icon"
                  height={700}
                  width={700}
                  className="w-4"
                />
                Trouvez les talents de demain
              </>
            )}
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() =>
            handleTypeCompteSelection(eleve ? "eleve" : "entreprise")
          }
        >
          {eleve ? "Créer un compte élève" : "Créer un compte entreprise"}
        </Button>
      </CardFooter>
    </Card>
  );
};
