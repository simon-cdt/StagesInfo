"use client";

import FileUpload from "@/components/form/FileUpload";
import { FormField } from "@/components/form/FormField";
import Icon from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStudent } from "@/lib/actions/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function UpdateStudentInformationsForm({
  student,
}: {
  student: {
    name: string;
    firstName: string;
    email: string;
    skills: string;
  };
}) {
  const router = useRouter();

  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    firstName: z.string().nonempty("Le prénom est requis."),
    email: z
      .string()
      .nonempty("L'e-mail est requis")
      .email("L'e-mail est invalide.")
      .refine((val) => val.endsWith("@eduge.ch"), {
        message: "L'email doit se terminer par @eduge.ch.",
      }),
    resume: z.custom<File>().optional(),
    skills: z
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

  const [skills, setSkills] = useState<string[]>(
    student.skills.length > 0 ? student.skills.split(",") : [],
  );
  const [newSkill, setNewSkill] = useState("");

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
    const skills =
      data.skills && data.skills?.length > 0 ? data.skills?.join(",") : "";

    const response = await updateStudent({
      name: data.name,
      firstName: data.firstName,
      email: data.email,
      skills,
      resume: data.resume,
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
                  name="name"
                  type="text"
                  defaultValue={student.name}
                  register={register}
                  error={errors.name}
                  icon={<Icon src="user" />}
                />
                <FormField
                  label="Prénom"
                  name="firstName"
                  type="text"
                  defaultValue={student.firstName}
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
                defaultValue={student.email}
                placeholder="exemple@eduge.ch"
                register={register}
                error={errors.email}
                icon={<Icon src="mail" />}
              />
              <div className="flex flex-col gap-2">
                <FileUpload
                  errorsForm={errors.resume?.message}
                  setValue={setValue}
                  id="resume"
                  label={
                    <div className="flex items-center justify-between">
                      <Label htmlFor="resume">CV (PDF)</Label>
                      <Link
                        href={"/account/resume"}
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
                  <Label htmlFor="skills">Compétences (5 max)</Label>
                  <span className="text-muted-foreground text-xs">
                    {skills ? skills.length : "0"}/5
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills &&
                    skills.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="py-1 pr-1 pl-2"
                      >
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
                    disabled={skills && skills.length >= 5}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={addSkill}
                    disabled={
                      (skills && skills.length >= 5) || !newSkill.trim()
                    }
                  >
                    <Icon src="plus" className="w-6" />
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
