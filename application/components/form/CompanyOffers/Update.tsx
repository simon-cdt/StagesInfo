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
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FetchSectorsList } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import Icon from "@/components/Icon";
import { updateOffer } from "@/lib/actions/company";

function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<FetchSectorsList> => {
      const response = await fetch(`/api/sectors`);
      return await response.json();
    },
  });
}

export default function UpdateCompanyOfferForm({
  id,
  title,
  description,
  sectorId,
  duration,
  startDate,
  endDate,
  location,
  skills,
  refetch,
  disabled,
}: {
  id: string;
  title: string;
  description: string;
  sectorId: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  location: string;
  skills: string;
  disabled: boolean;
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { isError, data: sectors, isLoading } = useSectors();

  const zodFormSchema = z.object({
    title: z.string().nonempty("Le titre est requis."),
    description: z.string().nonempty("La description est requise."),
    duration: z.string().nonempty("La durée est requise."),
    startDate: z
      .string()
      .nonempty("La date de début est requise.")
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "La date de début est invalide.",
      }),
    endDate: z
      .string()
      .nonempty("La date de fin est requise.")
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "La date de fin est invalide.",
      }),
    location: z.string().nonempty("Le lieu est requis."),
    skills: z.array(z.string()).optional(),
    sectorId: z.string().nonempty("Le secteur est requis."),
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
      sectorId: sectorId,
    },
  });

  const [skillsList, setSkillList] = useState<string[]>(skills.split(","));
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    setValue("skills", skillsList);
  }, [skillsList, setValue]);

  const addSkill = () => {
    if (newSkill.trim() && skillsList.length < 5) {
      setSkillList([...skillsList, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const deleteSkill = (index: number) => {
    setSkillList(skillsList.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateOffer({
      id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
      location: data.location,
      skills: data.skills ? data.skills : [],
      sectorId: data.sectorId,
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
            <p>{disabled ? "Interdit" : "Modifier"}</p>
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
              name="title"
              type="text"
              register={register}
              error={errors.title}
              defaultValue={title}
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
                name="startDate"
                type="text"
                register={register}
                error={errors.startDate}
                defaultValue={format(startDate, "yyyy-MM-dd")}
                icon={<Icon src="calendar" />}
              />
              <FormField
                label="Date de fin"
                name="endDate"
                type="text"
                register={register}
                error={errors.endDate}
                defaultValue={format(endDate, "yyyy-MM-dd")}
                icon={<Icon src="calendar" />}
              />
            </div>
            <div className="flex justify-between gap-2">
              <FormField
                label="Durée"
                name="duration"
                type="text"
                register={register}
                error={errors.duration}
                defaultValue={duration}
                icon={<Icon src="clock" />}
              />
              <FormField
                label="Lieu"
                name="location"
                type="text"
                register={register}
                error={errors.location}
                defaultValue={location}
                icon={<Icon src="map-pin" />}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sectors">Secteur</Label>
              <Select
                onValueChange={(value) => setValue("sectorId", value)}
                defaultValue={sectorId}
              >
                <SelectTrigger className="pointer">
                  <SelectValue placeholder="Sélectionne un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading && <SelectItem value="">Chargement...</SelectItem>}
                  {isError && (
                    <SelectItem value="">Erreur de chargement</SelectItem>
                  )}
                  {sectors?.map((sectors) => (
                    <SelectItem
                      key={sectors.id}
                      value={sectors.id}
                      className="pointer"
                    >
                      {sectors.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sectorId && (
                <small className="text-red-500">
                  {errors.sectorId.message}
                </small>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="skills">Compétences (5 max)</Label>
                <span className="text-muted-foreground text-xs">
                  {skillsList ? skillsList.length : "0"}/5
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillsList &&
                  skillsList.map((skill, i) => (
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
                  disabled={skillsList && skillsList.length >= 5}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={addSkill}
                  disabled={
                    (skillsList && skillsList.length >= 5) || !newSkill.trim()
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
