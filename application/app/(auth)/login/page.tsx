"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PasswordField from "@/components/form/PasswordField";
import { FormField } from "@/components/form/FormField";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const zodFormSchema = z.object({
    email: z
      .string()
      .min(1, "L'email est requis.")
      .email("L'email est invalide."),
    mdp: z
      .string()
      .min(1, "Le mot de passe est requis.")
      .min(8, "Le mot de passe doit contenir au moins huit caractères."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const signInData = await signIn("credentials", {
      email: data.email,
      password: data.mdp,
      redirect: false,
    });
    if (signInData?.error) {
      toast.error(signInData.error);
    } else {
      toast.success("La connexion a bien réussie");
      router.push("/");
      router.refresh();
    }
  };
  return (
    <main className="flex w-full justify-center pt-20">
      <div className="flex w-[40%] flex-col items-center gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="mb-2 text-3xl font-bold">Connexion</h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à votre espace personnel
          </p>
        </div>
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="text-2xl">Connexion à votre compte</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour vous connecter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(handleSubmitForm)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-6">
                <FormField
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="exemple@mail.com"
                  register={register}
                  error={errors.email}
                  icon={
                    <Image
                      src={"/icon/mail.svg"}
                      alt="Icon"
                      width={700}
                      height={700}
                      className="w-4"
                    />
                  }
                />
                <PasswordField
                  id="mdp"
                  register={register}
                  label="Mot de passe"
                  errorsForm={errors.mdp?.message}
                />
                <Button
                  type="submit"
                  className="pointer w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Vous n&apos;avez pas encore de compte ?&nbsp;
                <Link href="/register" className="underline underline-offset-4">
                  Créer un compte
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
