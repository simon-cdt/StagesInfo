"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/form/FormField";
import FileUpload from "@/components/form/FileUpload";
import { createEtudiant } from "@/lib/actions/etudiant";
import PasswordConditionsField from "@/components/form/PasswordConditionsField";
import PasswordField from "@/components/form/PasswordField";
import Icon from "@/components/Icon";

export default function StudentRegisterForm() {
  const router = useRouter();

  const [competences, setCompetences] = useState<string[]>([]);
  const [nouvelleCompetence, setNouvelleCompetence] = useState("");

  const zodFormSchema = z
    .object({
      nom: z.string().nonempty("Le nom est requis."),
      prenom: z.string().nonempty("Le prénom est requis."),
      email: z
        .string()
        .nonempty("L'e-mail est requis")
        .email("L'e-mail est invalide.")
        .refine((val) => val.endsWith("@eduge.ch"), {
          message: "L'email doit se terminer par @eduge.ch.",
        }),
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
      cv: z
        .custom<File>((val) => val instanceof File, {
          message: "Un fichier est requis.",
        })
        .refine((val) => val.type === "application/pdf", {
          message: "Le fichier doit être au format PDF.",
        }),
      competences: z
        .array(z.string())
        .max(5, "Vous ne pouvez pas ajouter plus de 5 compétences.")
        .optional(),
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
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const competences =
      data.competences && data.competences?.length > 0
        ? data.competences?.join(",")
        : "";

    const response = await createEtudiant({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      mdp: data.mdp,
      competences,
      cv: data.cv,
    });

    if (response.success) {
      toast.success(response.message);
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
      toast.error(response.message);
    }
  };

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

  return (
    <div className="flex flex-col gap-5 pt-10">
      <Button
        variant="ghost"
        onClick={() => router.push("/register")}
        className="best-transition w-fit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Retour
      </Button>

      <Card className="flex w-[700px] flex-col gap-1">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte élève</CardTitle>
          <CardDescription>
            Remplissez le formulaire ci-dessous pour créer votre compte
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nom"
                name="nom"
                type="text"
                placeholder="Votre nom"
                register={register}
                error={errors.prenom}
                icon={<Icon src="user" />}
              />
              <FormField
                label="Prénom"
                name="prenom"
                type="text"
                placeholder="Votre prénom"
                register={register}
                error={errors.prenom}
                icon={<Icon src="user" />}
              />
            </div>
            <FormField
              label="E-mail"
              name="email"
              type="email"
              placeholder="exemple@eduge.ch"
              register={register}
              error={errors.email}
              icon={<Icon src="mail" />}
            />
            <div className="grid grid-cols-2 gap-4">
              <PasswordConditionsField
                id="mdp"
                setValue={setValue}
                label="Mot de passe"
              />
              <PasswordField
                id="confirmationMdp"
                register={register}
                label="Confirmer le mot de passe"
                errorsForm={errors.confirmationMdp?.message}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FileUpload
                errorsForm={errors.cv?.message}
                setValue={setValue}
                id="cv"
                label="CV (PDF)"
                text="Ajoutez votre CV"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="competences">Compétences (5 max)</Label>
                <span className="text-muted-foreground text-xs">
                  {competences.length}/5
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {competences.map((c, i) => (
                  <Badge key={i} variant="secondary" className="py-1 pr-1 pl-2">
                    {c}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4"
                      onClick={() => supprimerCompetence(i)}
                    >
                      <Icon src="xmark" />
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
                  disabled={competences.length >= 5}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={ajouterCompetence}
                  disabled={
                    competences.length >= 5 || !nouvelleCompetence.trim()
                  }
                >
                  <Icon src="plus" />
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
                "Créer mon compte"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
