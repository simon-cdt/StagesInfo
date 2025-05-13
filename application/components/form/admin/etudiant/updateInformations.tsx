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
import { updateEtudiant } from "@/lib/actions/admin";
import toast from "react-hot-toast";

export default function UpdateEtudiantAdminInformationsForm({
  etudiant,
  refetch,
}: {
  etudiant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string;
  };
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

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
    defaultValues: {
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      email: etudiant.email,
      competences: etudiant.competences ? etudiant.competences.split(",") : [],
    },
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
    const response = await updateEtudiant({
      etudiant: {
        id: etudiant.id,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        competences: data.competences,
      },
    });
    if (response.success) {
      toast.success(response.message);
      refetch();
    } else {
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
                name="nom"
                type="text"
                defaultValue={etudiant.nom}
                register={register}
                error={errors.prenom}
                icon={<Icon src="user" />}
              />
              <FormField
                label="Prénom"
                name="prenom"
                type="text"
                defaultValue={etudiant.prenom}
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
              defaultValue={etudiant.email}
              placeholder="exemple@eduge.ch"
              register={register}
              error={errors.email}
              icon={<Icon src="mail" />}
            />

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
                  <Icon src="plus" className="w-6" />
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
