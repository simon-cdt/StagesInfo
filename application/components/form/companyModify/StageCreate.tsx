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
import toast from "react-hot-toast";
import DateField from "../DateField";
import { creerOffreStage } from "@/lib/actions/entreprise";

function useSecteurs() {
  return useQuery({
    queryKey: ["secteurs"],
    queryFn: async (): Promise<FetchSecteursList> => {
      const response = await fetch(`/api/secteurs`);
      return await response.json();
    },
  });
}

export default function StageCreate({ refetch }: { refetch: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const { isError, data: secteurs, isLoading } = useSecteurs();

  const zodFormSchema = z.object({
    titre: z.string().nonempty("Le titre est requis."),
    description: z.string().nonempty("La description est requise."),
    duree: z.string().nonempty("La durée est requise."),
    dateDebut: z
      .date()
      .refine((date: Date) => !!date, "La date de début est requise."),
    dateFin: z.date().refine((date) => !!date, "La date de fin est requise."),
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
  });

  const [competences, setCompetences] = useState<string[]>([]);
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
    console.log(data);

    const response = await creerOffreStage({
      titre: data.titre,
      description: data.description,
      duree: data.duree,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
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
        <Button onClick={() => setIsOpen(true)}>
          Créer une offre de stage
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Créer une nouvelle offre de stage</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <FormField
              label="Titre"
              name="titre"
              type="text"
              register={register}
              error={errors.titre}
            />
            <FormField
              label="Description"
              name="description"
              type="text"
              register={register}
              error={errors.description}
              textarea
            />
            <div className="flex justify-between gap-2">
              <DateField
                label="Date de début"
                id="dateDebut"
                setValue={setValue}
                errorForm={errors.dateDebut?.message}
              />
              <DateField
                label="Date de fin"
                id="dateFin"
                setValue={setValue}
                errorForm={errors.dateFin?.message}
              />
            </div>
            <div className="flex justify-between gap-2">
              <FormField
                label="Durée"
                name="duree"
                type="text"
                register={register}
                error={errors.duree}
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
              <Select onValueChange={(value) => setValue("secteur", value)}>
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
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
