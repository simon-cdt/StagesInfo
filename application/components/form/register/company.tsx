"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "../FormItem";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { FetchSecteursList } from "@/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function useSecteurs() {
  return useQuery({
    queryKey: ["secteurs"],
    queryFn: async (): Promise<FetchSecteursList> => {
      const response = await fetch(`/api/secteur`);
      return await response.json();
    },
  });
}

export default function CompanyRegisterForm({
  setEtape,
}: {
  setEtape: (etape: number) => void;
}) {
  const { isError, data: secteurs, isLoading } = useSecteurs();

  const router = useRouter();

  const zodFormSchema = z
    .object({
      nom: z.string().nonempty("Le nom est requis."),
      adresse: z.string().nonempty("L'adresse est requise."),
      email: z
        .string()
        .email("L'email doit être valide.")
        .nonempty("L'e-mail est requis."),
      mdp: z
        .string()
        .nonempty("Le mot de passe est requis.")
        .min(8, "Le mot de passe doit au moins faire huit caractères.")
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).+$/, {
          message:
            "Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial",
        }),
      confirmationMdp: z
        .string()
        .nonempty("La confirmation du mot de passe est requise."),
      contactNom: z.string().nonempty("Le nom du contact est requis."),
      contactPrenom: z.string().nonempty("Le prénom du contact est requis."),
      contactEmail: z
        .string()
        .email("L'email doit être valide.")
        .nonempty("L'e-mail du contact est requis."),
      secteurs: z.array(z.string()).min(1, "Au moins un secteur est requis."),
    })
    .refine((data) => data.mdp === data.confirmationMdp, {
      path: ["confirmationMdp"],
      message: "Les mots de passe ne correspondent pas.",
    });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      secteurs: [],
    },
  });
  const secteursWatch = watch("secteurs");
  const toggleSecteur = (id: string, checked: boolean) => {
    const current = watch("secteurs") || [];
    const updated = checked
      ? [...current, id]
      : current.filter((secteurId) => secteurId !== id);

    setValue("secteurs", updated, { shouldValidate: true });
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await fetch("/api/auth/company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: data.nom,
        adresse: data.adresse,
        email: data.email,
        mdp: data.mdp,
        contactNom: data.contactNom,
        contactPrenom: data.contactPrenom,
        contactEmail: data.contactEmail,
        secteurs: data.secteurs,
      }),
    });

    const message = await response.json();

    if (response.ok) {
      toast.success(message.message);
      const signInData = await signIn("credentials", {
        email: data.email,
        password: data.mdp,
        redirect: false,
      });
      if (signInData?.ok) {
        router.push("/");
      } else {
        toast.error("La connexion a échoué");
        router.push("/auth/login");
      }
    } else {
      toast.error(message.error);
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-10 pb-10">
      <Button
        variant="ghost"
        onClick={() => setEtape(1)}
        className="best-transition flex w-fit"
      >
        <Image
          src={"/icon/nav-arrow-left.svg"}
          alt="Flèche vers la gauche"
          width={700}
          height={700}
          className="w-4"
        />
        Retour
      </Button>
      <Card className="flex w-[700px] flex-col gap-1">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte entreprise</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour créer votre entreprise
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <CardContent className="flex flex-col gap-6 p-6">
            <Separator className="bg-black/50" />
            <CardTitle className="font-semibold">Entreprise</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nom"
                name="nom"
                type="text"
                placeholder="Le nom de l'entreprise"
                register={register}
                error={errors.nom}
                icon={
                  <Image
                    src={"/icon/building.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
              <FormField
                label="E-mail"
                name="email"
                type="email"
                placeholder="entreprise@mail.com"
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
            </div>
            <FormField
              label="Adresse"
              name="adresse"
              type="text"
              placeholder="L'adresse de l'entreprise"
              register={register}
              error={errors.adresse}
              icon={
                <Image
                  src={"/icon/map-pin.svg"}
                  alt="Icon"
                  width={700}
                  height={700}
                  className="w-5"
                />
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Mot de passe"
                name="mdp"
                type="password"
                placeholder="********"
                register={register}
                error={errors.mdp}
                icon={
                  <Image
                    src={"/icon/lock.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-5"
                  />
                }
              />
              <FormField
                label="Confirmer le mot de passe"
                name="confirmationMdp"
                type="password"
                placeholder="********"
                register={register}
                error={errors.confirmationMdp}
                icon={
                  <Image
                    src={"/icon/lock.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-5"
                  />
                }
              />
            </div>
            <Separator className="bg-black/50" />
            <CardTitle className="font-semibold">
              Contact de l&apos;entreprise
            </CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nom"
                name="contactNom"
                type="text"
                placeholder="Nom du contact"
                register={register}
                error={errors.contactNom}
                icon={
                  <Image
                    src={"/icon/user.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
              <FormField
                label="Prénom"
                name="contactPrenom"
                type="text"
                placeholder="Prénom du contact"
                register={register}
                error={errors.contactPrenom}
                icon={
                  <Image
                    src={"/icon/user.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
            </div>
            <FormField
              label="E-mail"
              name="contactEmail"
              type="text"
              placeholder="contact@mail.com"
              register={register}
              error={errors.contactEmail}
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

            <Separator className="bg-black/50" />
            <CardTitle className="font-semibold">
              Secteurs de l&apos;entreprise
            </CardTitle>
            <div className="flex flex-wrap gap-y-5">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => {
                  return (
                    <div
                      key={index}
                      className="flex w-[50%] items-center gap-2"
                    >
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-60" />
                    </div>
                  );
                })
              ) : isError ? (
                <p className="font-semibold text-red-500">
                  Une erreur est survenue. Il n&apos;est pas possible de choisir
                  un secteur actuellement. Veuillez réessayer plus tard...
                </p>
              ) : (
                secteurs &&
                secteurs.map((secteur) => {
                  return (
                    <div
                      key={secteur.id}
                      className="flex w-[50%] items-center gap-2"
                    >
                      <Checkbox
                        id={`secteur-${secteur.id}`}
                        checked={secteursWatch?.includes(secteur.id)}
                        onCheckedChange={(checked) =>
                          toggleSecteur(secteur.id, Boolean(checked))
                        }
                      />
                      <Label
                        htmlFor={`secteur-${secteur.id}`}
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {secteur.label}
                      </Label>
                    </div>
                  );
                })
              )}
              {errors.secteurs && (
                <p className="text-sm text-red-500">
                  {errors.secteurs.message}
                </p>
              )}
            </div>
            <Button disabled={isSubmitting} className="w-full" type="submit">
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
