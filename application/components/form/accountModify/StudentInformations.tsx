"use client";

import FileUpload from "@/components/form/FileUpload";
import { FormField } from "@/components/form/FormField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { modifierEtudiant } from "@/lib/actions/etudiant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function FormModifyInformationsStudent({
  etudiant,
}: {
  etudiant: {
    nom: string;
    prenom: string;
    email: string;
    competences: string;
  };
}) {
  const router = useRouter();

  const zodFormSchema = z.object({
    nom: z.string().nonempty("Le nom est requis."),
    prenom: z.string().nonempty("Le prénom est requis."),
    email: z
      .string()
      .nonempty("L'e-mail est requis")
      .email("L'e-mail est invalide.")
      .refine((val) => val.endsWith("@eduge.ch"), {
        message: "L'email doit se terminer par @eduge.ch.",
      }),
    cv: z.custom<File>().optional(),
    competences: z
      .array(z.string())
      .max(5, "Vous ne pouvez pas ajouter plus de 5 compétences.")
      .optional(),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const [competences, setCompetences] = useState<string[]>(
    etudiant.competences.length > 0 ? etudiant.competences.split(",") : [],
  );
  const [nouvelleCompetence, setNouvelleCompetence] = useState("");

  useEffect(() => {
    setValue("competences", competences);
  }, [competences, setValue]);

  const ajouterCompetence = () => {
    if (nouvelleCompetence.trim() && competences.length < 5) {
      setCompetences([...competences, nouvelleCompetence.trim()]);
      setNouvelleCompetence("");
    }
  };

  const supprimerCompetence = (index: number) => {
    setCompetences(competences.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ajouterCompetence();
    }
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const competences =
      data.competences && data.competences?.length > 0
        ? data.competences?.join(",")
        : "";

    const response = await modifierEtudiant({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      competences,
      cv: data.cv,
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
                  defaultValue={etudiant.nom}
                  register={register}
                  error={errors.prenom}
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
                  name="prenom"
                  type="text"
                  defaultValue={etudiant.prenom}
                  placeholder="Votre prénom"
                  register={register}
                  error={errors.prenom}
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
                name="email"
                type="email"
                defaultValue={etudiant.email}
                placeholder="exemple@eduge.ch"
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
              <div className="flex flex-col gap-2">
                <FileUpload
                  errorsForm={errors.cv?.message}
                  setValue={setValue}
                  id="cv"
                  label={
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cv">CV (PDF)</Label>
                      <Link
                        href={"/account/cv"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="button" variant={"outline"}>
                          CV actuel
                        </Button>
                      </Link>
                    </div>
                  }
                  text="Mettez à jour votre CV"
                />
                <p className="text-xs text-gray-500">
                  Si vous ne téléchargez rien, votre CV actuel ne sera pas
                  changé.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="competences">Compétences (5 max)</Label>
                  <span className="text-muted-foreground text-xs">
                    {competences ? competences.length : "0"}/5
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {competences &&
                    competences.map((c, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="py-1 pr-1 pl-2"
                      >
                        {c}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-4 w-4"
                          onClick={() => supprimerCompetence(i)}
                        >
                          <Image
                            src={"/icon/xmark.svg"}
                            alt="icon"
                            width={700}
                            height={700}
                            className="w-4"
                          />
                        </Button>
                      </Badge>
                    ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    id="competences"
                    placeholder="Ajouter une compétence"
                    value={nouvelleCompetence}
                    onChange={(e) => setNouvelleCompetence(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={competences && competences.length >= 5}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={ajouterCompetence}
                    disabled={
                      (competences && competences.length >= 5) ||
                      !nouvelleCompetence.trim()
                    }
                  >
                    <Image
                      src={"/icon/plus.svg"}
                      alt="Icon"
                      width={700}
                      height={700}
                      color="white"
                      className="w-6"
                    />
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Appuyez sur Entrée ou cliquez sur le bouton + pour ajouter
                </p>
                {errors.competences && (
                  <small className="font-medium text-red-500">
                    {errors.competences.message}
                  </small>
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
