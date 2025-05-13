"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { FormField } from "../FormField";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FetchSecteursList } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { modifierOffreStage } from "@/lib/actions/entreprise";
import toast from "react-hot-toast";
import Icon from "@/components/Icon";

function useSecteurs() {
  return useQuery({
    queryKey: ["secteurs"],
    queryFn: async (): Promise<FetchSecteursList> => {
      const response = await fetch(`/api/secteurs`);
      return await response.json();
    },
  });
}

export default function StageModify({
  id,
  titre,
  description,
  secteurId,
  duree,
  dateDebut,
  dateFin,
  lieu,
  competences: competencesDefault,
  refetch,
  disabled,
}: {
  id: string;
  titre: string;
  description: string;
  secteurId: string;
  duree: string;
  dateDebut: Date;
  dateFin: Date;
  lieu: string;
  competences: string;
  disabled: boolean;
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { isError, data: secteurs, isLoading } = useSecteurs();

  const zodFormSchema = z.object({
    titre: z.string().nonempty("Le titre est requis."),
    description: z.string().nonempty("La description est requise."),
    duree: z.string().nonempty("La durée est requise."),
    dateDebut: z
      .string()
      .nonempty("La date de début est requise.")
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "La date de début est invalide.",
      }),
    dateFin: z
      .string()
      .nonempty("La date de fin est requise.")
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "La date de fin est invalide.",
      }),
    lieu: z.string().nonempty("Le lieu est requis."),
    competences: z.array(z.string()).optional(),
    secteur: z.string().nonempty("Le secteur est requis."),
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
      secteur: secteurId,
    },
  });

  const [competences, setCompetences] = useState<string[]>(
    competencesDefault.split(","),
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
    const response = await modifierOffreStage({
      id,
      titre: data.titre,
      description: data.description,
      duree: data.duree,
      dateDebut: format(data.dateDebut, "yyyy-MM-dd"),
      dateFin: format(data.dateFin, "yyyy-MM-dd"),
      lieu: data.lieu,
      competences: data.competences ? data.competences : [],
      secteur: data.secteur,
    });

    if (response.success) {
      toast.success(response.message);
      setIsOpen(false);
      refetch();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={disabled ? "disable" : "outline"}
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-1">
            <Icon src="page-edit" />
            <p>{disabled ? "Interdit" : "Voir les détails"}</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Modifier l&apos;offre</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <FormField
              label="Titre"
              name="titre"
              type="text"
              register={register}
              error={errors.titre}
              defaultValue={titre}
            />
            <FormField
              label="Description"
              name="description"
              type="text"
              register={register}
              error={errors.description}
              defaultValue={description}
              textarea
            />

            <div className="flex justify-between gap-2">
              <FormField
                label="Date de début"
                name="dateDebut"
                type="text"
                register={register}
                error={errors.dateDebut}
                defaultValue={format(dateDebut, "yyyy-MM-dd")}
                icon={
                  <Image
                    src={"/icon/calendar.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
              <FormField
                label="Date de fin"
                name="dateFin"
                type="text"
                register={register}
                error={errors.dateFin}
                defaultValue={format(dateFin, "yyyy-MM-dd")}
                icon={
                  <Image
                    src={"/icon/calendar.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
            </div>
            <div className="flex justify-between gap-2">
              <FormField
                label="Durée"
                name="duree"
                type="text"
                register={register}
                error={errors.duree}
                defaultValue={duree}
                icon={
                  <Image
                    src={"/icon/clock.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
              />
              <FormField
                label="Lieu"
                name="lieu"
                type="text"
                register={register}
                error={errors.lieu}
                defaultValue={lieu}
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
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="secteur">Secteur</Label>
              <Select
                onValueChange={(value) => setValue("secteur", value)}
                defaultValue={secteurId}
              >
                <SelectTrigger className="pointer">
                  <SelectValue placeholder="Sélectionne un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading && <SelectItem value="">Chargement...</SelectItem>}
                  {isError && (
                    <SelectItem value="">Erreur de chargement</SelectItem>
                  )}
                  {secteurs?.map((secteur) => (
                    <SelectItem
                      key={secteur.id}
                      value={secteur.id}
                      className="pointer"
                    >
                      {secteur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.secteur && (
                <small className="text-red-500">{errors.secteur.message}</small>
              )}
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Fermer
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={isSubmitting ? "disable" : "default"}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
