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
import { createStudent } from "@/lib/actions/student";
import PasswordConditionsField from "@/components/form/PasswordConditionsField";
import PasswordField from "@/components/form/PasswordField";
import Icon from "@/components/Icon";

export default function StudentRegisterForm() {
  const router = useRouter();

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const zodFormSchema = z
    .object({
      name: z.string().nonempty("Le nom est requis."),
      firstName: z.string().nonempty("Le prénom est requis."),
      email: z
        .string()
        .nonempty("L'e-mail est requis")
        .email("L'e-mail est invalide.")
        .refine((val) => val.endsWith("@eduge.ch"), {
          message: "L'email doit se terminer par @eduge.ch.",
        }),
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
      resume: z
        .custom<File>((val) => val instanceof File, {
          message: "Un fichier est requis.",
        })
        .refine((val) => val.type === "application/pdf", {
          message: "Le fichier doit être au format PDF.",
        }),
      skills: z
        .array(z.string())
        .max(5, "Vous ne pouvez pas ajouter plus de 5 compétences.")
        .optional(),
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
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const skills =
      data.skills && data.skills?.length > 0 ? data.skills?.join(",") : "";

    const response = await createStudent({
      name: data.name,
      firstName: data.firstName,
      email: data.email,
      password: data.password,
      skills: skills,
      resume: data.resume,
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

  useEffect(() => {
    setValue("skills", skills);
  }, [skills, setValue]);

  const addSkill = () => {
    if (newSkill.trim() && skills.length < 5) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const deleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
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
                name="name"
                type="text"
                placeholder="Votre nom"
                register={register}
                error={errors.name}
                icon={<Icon src="user" />}
              />
              <FormField
                label="Prénom"
                name="firstName"
                type="text"
                placeholder="Votre prénom"
                register={register}
                error={errors.firstName}
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

            <div className="flex flex-col gap-2">
              <FileUpload
                errorsForm={errors.resume?.message}
                setValue={setValue}
                id="resume"
                label="CV (PDF)"
                text="Ajoutez votre CV"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="skills">Compétences (5 max)</Label>
                <span className="text-muted-foreground text-xs">
                  {skills.length}/5
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((c, i) => (
                  <Badge key={i} variant="secondary" className="py-1 pr-1 pl-2">
                    {c}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4"
                      onClick={() => deleteSkill(i)}
                    >
                      <Icon src="xmark" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="Ajouter une compétence"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={skills.length >= 5}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={addSkill}
                  disabled={skills.length >= 5 || !newSkill.trim()}
                >
                  <Icon src="plus" />
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Appuyez sur Entrée ou cliquez sur le bouton + pour ajouter
              </p>
              {errors.skills && (
                <small className="font-medium text-red-500">
                  {errors.skills.message}
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
