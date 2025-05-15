"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/Icon";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import FileUpload from "../../FileUpload";
import PasswordField from "../../PasswordField";
import PasswordConditionsField from "../../PasswordConditionsField";
import { FormField } from "../../FormField";
import toast from "react-hot-toast";
import { createStudentAdmin } from "@/lib/actions/admin/student";

export default function CreateStudentAdminForm({
  refetch,
}: {
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

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

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await createStudentAdmin({
      name: data.name,
      firstName: data.firstName,
      email: data.email,
      password: data.password,
      skills: skills.join(","),
      resume: data.resume,
    });

    if (response.success) {
      setOpen(false);
      toast.success(response.message);
      refetch();
    } else {
      setOpen(false);
      toast.error(response.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Créer un étudiant</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Créer un étudiant</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l&apos;étudiant et téléchargez son
            CV.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="flex flex-col gap-6 p-6">
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
                {skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="py-1 pr-1 pl-2">
                    {skill}
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
            <div className="flex w-full items-center justify-between">
              <Button
                type="button"
                variant={"outline"}
                className="w-[48%]"
                onClick={() => setOpen(false)}
              >
                Fermer
              </Button>
              <Button
                disabled={isSubmitting}
                variant={`${isSubmitting ? "disable" : "default"}`}
                className="w-[48%]"
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
