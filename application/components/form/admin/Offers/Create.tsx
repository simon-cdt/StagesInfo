"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormField } from "../../FormField";
import DateField from "../../DateField";
import Icon from "@/components/Icon";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FetchSectorsList } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { createOfferAdmin } from "@/lib/actions/admin/offer";
import SelectWithSearch from "../../SelectWithSearch";

type FetchCompany = [
  {
    id: string;
    name: string;
    address: string;
    email: string;
    sectors: [
      {
        secteur: {
          id: string;
          label: string;
          color: string;
        };
      },
    ];
    contact: {
      id: string;
      name: string;
      firstName: string;
      email: string;
    };
    deleteable: boolean;
  },
];

function useCompany() {
  return useQuery({
    queryKey: ["company_admin"],
    queryFn: async (): Promise<FetchCompany> => {
      const response = await fetch(`/api/admin/companies`);
      return await response.json();
    },
  });
}

function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<FetchSectorsList> => {
      const response = await fetch(`/api/sectors`);
      return await response.json();
    },
  });
}

export default function CreateOfferAdminForm({
  refetch,
}: {
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    isError: isErrorSectors,
    data: sectors,
    isLoading: isLoadingSectors,
  } = useSectors();

  const {
    isError: isErrorCompany,
    data: companies,
    isLoading: isLoadingCompany,
  } = useCompany();

  const zodFormSchema = z.object({
    companyId: z.string().nonempty("L'entreprise est requise."),
    title: z.string().nonempty("Le titre est requis."),
    description: z.string().nonempty("La description est requise."),
    duration: z.string().nonempty("La durée est requise."),
    startDate: z
      .date()
      .refine((date: Date) => !!date, "La date de début est requise."),
    endDate: z.date().refine((date) => !!date, "La date de fin est requise."),
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
  });

  const [skills, setSkills] = useState<string[]>([]);
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
    const response = await createOfferAdmin({
      companyId: data.companyId,
      sectorId: data.sectorId,
      title: data.title,
      description: data.description,
      duration: data.duration,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      skills: data.skills ? data.skills : [],
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
            <SelectWithSearch
              id="companyId"
              errorsForm={errors.companyId?.message}
              isError={isErrorCompany}
              isLoading={isLoadingCompany}
              items={
                companies &&
                companies.map((company) => {
                  return { label: company.name, value: company.id };
                })
              }
              label="Sélectionnez une entreprise"
              placeHolderSelect="Sélectionnez une entreprise"
              setValue={setValue}
              notFoundItem="Aucune entreprise trouvée"
              placeHolderInput="Rechercher une entreprise..."
            />
            <FormField
              label="Titre"
              name="title"
              type="text"
              register={register}
              error={errors.title}
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
                id="startDate"
                setValue={setValue}
                errorForm={errors.startDate?.message}
              />
              <DateField
                label="Date de fin"
                id="endDate"
                setValue={setValue}
                errorForm={errors.endDate?.message}
              />
            </div>
            <div className="flex justify-between gap-2">
              <FormField
                label="Durée"
                name="duration"
                type="text"
                register={register}
                error={errors.duration}
                icon={<Icon src="clock" />}
              />
              <FormField
                label="Lieu"
                name="location"
                type="text"
                register={register}
                error={errors.location}
                icon={<Icon src="map-pin" />}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sectorId">Secteur</Label>
              <Select onValueChange={(value) => setValue("sectorId", value)}>
                <SelectTrigger className="pointer">
                  <SelectValue placeholder="Sélectionne un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingSectors && (
                    <SelectItem value="">Chargement...</SelectItem>
                  )}
                  {isErrorSectors && (
                    <SelectItem value="">Erreur de chargement</SelectItem>
                  )}
                  {sectors?.map((sector) => (
                    <SelectItem
                      key={sector.id}
                      value={sector.id}
                      className="pointer"
                    >
                      {sector.label}
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
                  <Icon src={"plus"} className="w-6" />
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
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
