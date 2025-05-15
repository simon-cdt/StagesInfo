"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import PasswordField from "../../PasswordField";
import PasswordConditionsField from "../../PasswordConditionsField";
import { FormField } from "../../FormField";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { FetchSectorsList } from "@/types/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { createCompanyAdmin } from "@/lib/actions/admin/company";

function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<FetchSectorsList> => {
      const response = await fetch(`/api/sectors`);
      return await response.json();
    },
  });
}

export default function CreateCompanyAdminForm({
  refetch,
}: {
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

  const { isError, data: sectors, isLoading } = useSectors();

  const zodFormSchema = z
    .object({
      name: z.string().nonempty("Le nom est requis."),
      address: z.string().nonempty("L'adresse est requise."),
      email: z
        .string()
        .email("L'email doit être valide.")
        .nonempty("L'e-mail est requis."),
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
      contactName: z.string().nonempty("Le nom du contact est requis."),
      contactFirstName: z.string().nonempty("Le prénom du contact est requis."),
      contactEmail: z
        .string()
        .email("L'email doit être valide.")
        .nonempty("L'e-mail du contact est requis."),
      sectors: z.array(z.string()).min(1, "Au moins un secteur est requis."),
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      sectors: [],
    },
  });
  const sectorsWatch = watch("sectors");
  const toggleSector = (id: string, checked: boolean) => {
    const current = watch("sectors") || [];
    const updated = checked
      ? [...current, id]
      : current.filter((sectorId) => sectorId !== id);

    setValue("sectors", updated, { shouldValidate: true });
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await createCompanyAdmin({
      name: data.name,
      address: data.address,
      email: data.email,
      password: data.password,
      contactName: data.contactName,
      contactFirstName: data.contactFirstName,
      contactEmail: data.contactEmail,
      sectors: data.sectors,
    });

    if (response.success) {
      toast.success(response.message);
      refetch();
      setOpen(false);
    } else {
      toast.error(response.message);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Créer une entreprise</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Créer une entreprise</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour créer une nouvelle
            entreprise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between">
              <div className="flex flex-col gap-6">
                <p className="font-semibold">
                  Informations de l&apos;entreprise
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Nom"
                    name="name"
                    type="text"
                    placeholder="Le nom de l'entreprise"
                    register={register}
                    error={errors.name}
                    icon={<Icon src="building" />}
                  />
                  <FormField
                    label="E-mail"
                    name="email"
                    type="email"
                    placeholder="entreprise@mail.com"
                    register={register}
                    error={errors.email}
                    icon={<Icon src="mail" />}
                  />
                </div>
                <FormField
                  label="Adresse"
                  name="address"
                  type="text"
                  placeholder="L'adresse de l'entreprise"
                  register={register}
                  error={errors.address}
                  icon={<Icon src="map-pin" />}
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
              </div>
              <div className="flex flex-col gap-6">
                <p className="font-semibold">Contact de l&apos;entreprise</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Nom"
                    name="contactName"
                    type="text"
                    placeholder="Nom du contact"
                    register={register}
                    error={errors.contactName}
                    icon={<Icon src="user" />}
                  />
                  <FormField
                    label="Prénom"
                    name="contactFirstName"
                    type="text"
                    placeholder="Prénom du contact"
                    register={register}
                    error={errors.contactFirstName}
                    icon={<Icon src="user" />}
                  />
                </div>
                <FormField
                  label="E-mail"
                  name="contactEmail"
                  type="text"
                  placeholder="contact@mail.com"
                  register={register}
                  error={errors.contactEmail}
                  icon={<Icon src="mail" />}
                />
              </div>
            </div>
            <Separator className="bg-black/50" />
            <div className="flex flex-col gap-6">
              <p className="font-semibold">Secteurs de l&apos;entreprise</p>
              <div className="flex flex-wrap gap-y-5">
                {isLoading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => {
                    return (
                      <div
                        key={index}
                        className="flex w-[50%] items-center gap-2"
                      >
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-60" />
                      </div>
                    );
                  })
                ) : isError ? (
                  <p className="font-semibold text-red-500">
                    Une erreur est survenue. Il n&apos;est pas possible de
                    choisir un secteur actuellement. Veuillez réessayer plus
                    tard...
                  </p>
                ) : (
                  sectors &&
                  sectors.map((sector) => {
                    return (
                      <div
                        key={sector.id}
                        className="flex w-[50%] items-center gap-2"
                      >
                        <Checkbox
                          id={`sector-${sector.id}`}
                          checked={sectorsWatch?.includes(sector.id)}
                          onCheckedChange={(checked) =>
                            toggleSector(sector.id, Boolean(checked))
                          }
                        />
                        <Label
                          htmlFor={`sector-${sector.id}`}
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {sector.label}
                        </Label>
                      </div>
                    );
                  })
                )}
                {errors.sectors && (
                  <p className="text-sm text-red-500">
                    {errors.sectors.message}
                  </p>
                )}
              </div>
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
                  "Créer l'entreprise"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
