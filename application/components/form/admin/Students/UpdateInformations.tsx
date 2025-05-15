"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormField } from "../../FormField";
import Icon from "@/components/Icon";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { updateStudentAdmin } from "@/lib/actions/admin/student";

export default function UpdateStudentInformationsAdminForm({
  student,
  refetch,
}: {
  student: {
    id: string;
    name: string;
    firstName: string;
    email: string;
    skills: string;
  };
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

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
    defaultValues: {
      name: student.name,
      firstName: student.firstName,
      email: student.email,
      skills: student.skills ? student.skills.split(",") : [],
    },
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
    const response = await updateStudentAdmin({
      student: {
        id: student.id,
        name: data.name,
        firstName: data.firstName,
        email: data.email,
        skills: data.skills,
      },
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
        <Button variant="outline">
          <div className="flex items-center gap-1">
            <Icon src="page-edit" />
            <p>Modifier</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          <DialogDescription>
            Vous pouvez changer les informations d&apos;utilisateur juste ici.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="grid gap-4 py-4">
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
                  disabled={(skills && skills.length >= 5) || !newSkill.trim()}
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
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                type="button"
                className="w-max"
                variant={"outline"}
                onClick={() => setOpen(false)}
              >
                Fermer
              </Button>
              <Button
                disabled={isSubmitting}
                variant={`${isSubmitting ? "disable" : "default"}`}
                className="w-max"
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Sauvegarder les modifications"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
