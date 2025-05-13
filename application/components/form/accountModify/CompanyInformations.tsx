"use client";

import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { modifierEntreprise } from "@/lib/actions/entreprise";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function FormModifyInformationsCompany({
  entreprise,
  secteurs,
}: {
  entreprise: {
    nom: string;
    adresse: string;
    email: string;
  };
  secteurs: {
    id: string;
    label: string;
    checked: boolean;
  }[];
}) {
  const router = useRouter();

  const zodFormSchema = z.object({
    nom: z.string().nonempty("Le nom est requis."),
    adresse: z.string().nonempty("L'adresse est requise."),
    email: z
      .string()
      .nonempty("L'e-mail est requis")
      .email("L'e-mail est invalide."),
    secteurs: z.array(z.string()).min(1, "Au moins un secteur est requis."),
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
      nom: entreprise.nom,
      adresse: entreprise.adresse,
      email: entreprise.email,
      secteurs: secteurs
        .filter((secteur) => secteur.checked)
        .map((secteur) => secteur.id),
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
    const response = await modifierEntreprise({
      nom: data.nom,
      email: data.email,
      adresse: data.adresse,
      secteurs: data.secteurs,
    });
    if (response.success) {
      toast.success(response.message);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex w-full justify-center pt-10">
      <div className="flex w-[80%] flex-col items-center justify-start gap-10">
        <div className="flex w-[700px] justify-start">
          <h1 className={"text-left text-3xl font-bold"}>
            Modifier mes informations
          </h1>
        </div>
        <Card className="flex w-[700px] flex-col gap-1">
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <CardContent className="flex flex-col gap-6 px-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Nom"
                  name="nom"
                  type="text"
                  defaultValue={entreprise.nom}
                  register={register}
                  error={errors.nom}
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
                  label="E-mail"
                  name="email"
                  type="email"
                  defaultValue={entreprise.email}
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
                defaultValue={entreprise.adresse}
                register={register}
                error={errors.adresse}
                icon={
                  <Image
                    src={"/icon/map-pin.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
              <div className="flex flex-wrap gap-y-5">
                {secteurs.map((secteur) => {
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
                })}
                {errors.secteurs && (
                  <p className="text-sm text-red-500">
                    {errors.secteurs.message}
                  </p>
                )}
              </div>
              <Button
                disabled={isSubmitting}
                variant={`${isSubmitting ? "disable" : "default"}`}
                className="w-full"
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Sauvegarder les modifications"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
