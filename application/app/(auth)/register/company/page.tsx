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
import { FormField } from "@/components/form/FormField";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { FetchSectorsList } from "@/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import PasswordConditionsField from "@/components/form/PasswordConditionsField";
import PasswordField from "@/components/form/PasswordField";
import { createCompany } from "@/lib/actions/company";
import Icon from "@/components/Icon";

function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<FetchSectorsList> => {
      const response = await fetch(`/api/sectors`);
      return await response.json();
    },
  });
}

export default function CompanyRegisterForm() {
  const { isError, data: sectors, isLoading } = useSectors();

  const router = useRouter();

  const zodFormSchema = z
    .object({
      name: z.string().nonempty("Le nom est requis."),
      address: z.string().nonempty("L'adresse est requise."),
      email: z
        .string()
        .email("L'email doit être valide.")
        .nonempty("L'e-mail est requis."),
      password: z
        .string()
        .nonempty("Le mot de passe est requis.")
        .min(8, "Le mot de passe doit au moins faire huit caractères.")
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).+$/, {
          message:
            "Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial",
        }),
      passwordConfirm: z
        .string()
        .nonempty("La confirmation du mot de passe est requise."),
      contactName: z.string().nonempty("Le nom du contact est requis."),
      contactFirstName: z.string().nonempty("Le prénom du contact est requis."),
      contactEmail: z
        .string()
        .email("L'email doit être valide.")
        .nonempty("L'e-mail du contact est requis."),
      sectors: z.array(z.string()).min(1, "Au moins un secteur est requis."),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ["passwordConfirm"],
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
      sectors: [],
    },
  });
  const sectorsWatch = watch("sectors");
  const toggleSecteur = (id: string, checked: boolean) => {
    const current = watch("sectors") || [];
    const updated = checked
      ? [...current, id]
      : current.filter((sectorId) => sectorId !== id);

    setValue("sectors", updated, { shouldValidate: true });
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await createCompany({
      name: data.name,
      address: data.address,
      email: data.email,
      password: data.password,
      contactName: data.contactName,
      contactFirstName: data.contactFirstName,
      contactEmail: data.contactEmail,
      sectors: data.sectors,
    });

    if (response.success) {
      toast.success(response.message);
      const signInData = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInData?.ok) {
        router.push("/");
      } else {
        toast.error("La connexion a échoué");
        router.push("/auth/login");
      }
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-10 pb-10">
      <Button
        variant="ghost"
        onClick={() => router.push("/register")}
        className="best-transition flex w-fit"
      >
        <Icon src="nav-arrow-left" />
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
                name="name"
                type="text"
                placeholder="Le nom de l'entreprise"
                register={register}
                error={errors.name}
                icon={<Icon src="building" />}
              />
              <FormField
                label="E-mail"
                name="email"
                type="email"
                placeholder="entreprise@mail.com"
                register={register}
                error={errors.email}
                icon={<Icon src="mail" />}
              />
            </div>
            <FormField
              label="Adresse"
              name="address"
              type="text"
              placeholder="L'adresse de l'entreprise"
              register={register}
              error={errors.address}
              icon={<Icon src="map-pin" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <PasswordConditionsField
                id="password"
                setValue={setValue}
                label="Mot de passe"
              />
              <PasswordField
                id="passwordConfirm"
                register={register}
                label="Confirmer le mot de passe"
                errorsForm={errors.passwordConfirm?.message}
              />
            </div>
            <Separator className="bg-black/50" />
            <CardTitle className="font-semibold">
              Contact de l&apos;entreprise
            </CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nom"
                name="contactName"
                type="text"
                placeholder="Nom du contact"
                register={register}
                error={errors.contactName}
                icon={<Icon src="user" />}
              />
              <FormField
                label="Prénom"
                name="contactFirstName"
                type="text"
                placeholder="Prénom du contact"
                register={register}
                error={errors.contactFirstName}
                icon={<Icon src="user" />}
              />
            </div>
            <FormField
              label="E-mail"
              name="contactEmail"
              type="text"
              placeholder="contact@mail.com"
              register={register}
              error={errors.contactEmail}
              icon={<Icon src="mail" />}
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
                sectors &&
                sectors.map((sector) => {
                  return (
                    <div
                      key={sector.id}
                      className="flex w-[50%] items-center gap-2"
                    >
                      <Checkbox
                        id={`secteur-${sector.id}`}
                        checked={sectorsWatch?.includes(sector.id)}
                        onCheckedChange={(checked) =>
                          toggleSecteur(sector.id, Boolean(checked))
                        }
                      />
                      <Label
                        htmlFor={`secteur-${sector.id}`}
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {sector.label}
                      </Label>
                    </div>
                  );
                })
              )}
              {errors.sectors && (
                <p className="text-sm text-red-500">{errors.sectors.message}</p>
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
