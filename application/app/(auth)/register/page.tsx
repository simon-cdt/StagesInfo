"use client";

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
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function InscriptionPage() {
  return (
    <main className="flex w-full justify-center">
      <div className="flex flex-col gap-10 pt-20 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="mb-4 text-3xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground mb-8">
            Rejoignez StageConnect et accédez à toutes nos fonctionnalités
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <StudentEntreprise eleve />

          <StudentEntreprise eleve={false} />
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export const StudentEntreprise = ({ eleve }: { eleve: boolean }) => {
  const router = useRouter();
  return (
    <Link href={`/register/${eleve ? "student" : "company"}`}>
      <Card className="hover:border-primary best-transition flex cursor-pointer flex-col gap-4">
        <CardHeader className="flex w-full flex-col items-center gap-2">
          <div className="bg-primary/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full p-3">
            <Icon
              src={`${eleve ? "graduation-cap" : "building"}.svg`}
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
                  <Icon src="check" />
                  Accédez à des milliers d&apos;offres de stage
                </>
              ) : (
                <>
                  <Icon src="check" />
                  Publiez vos offres de stage
                </>
              )}
            </li>
            <li className="flex items-center justify-center gap-2">
              {eleve ? (
                <>
                  <Icon src="check" />
                  Postulez en quelques clics
                </>
              ) : (
                <>
                  <Icon src="check" />
                  Gérez les candidatures reçues
                </>
              )}
            </li>
            <li className="flex items-center justify-center gap-2">
              {eleve ? (
                <>
                  <Icon src="check" />
                  Suivez vos candidatures
                </>
              ) : (
                <>
                  <Icon src="check" />
                  Trouvez les talents de demain
                </>
              )}
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex w-full items-center justify-center">
          <Button
            className="w-full"
            onClick={() =>
              router.push(`/register/${eleve ? "student" : "company"}`)
            }
          >
            {eleve ? "Créer un compte élève" : "Créer un compte entreprise"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
