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
import { Loader2 } from "lucide-react";
import { FormField } from "../../FormField";
import Icon from "@/components/Icon";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { FetchSectorsList } from "@/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { updateCompanyAdmin } from "@/lib/actions/admin/company";
import { useState } from "react";

function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<FetchSectorsList> => {
      const response = await fetch(`/api/sectors`);
      return await response.json();
    },
  });
}

export default function UpdateCompanyInformationsAdminForm({
  company,
  refetch,
}: {
  company: {
    id: string;
    name: string;
    email: string;
    address: string;
    sectors: string[];
  };
  refetch: () => void;
}) {
  const { data: sectors } = useSectors();

  const [open, setOpen] = useState(false);

  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    address: z.string().nonempty("L'adresse est requise."),
    email: z
      .string()
      .email("L'email doit être valide.")
      .nonempty("L'e-mail est requis."),
    sectors: z.array(z.string()).min(1, "Au moins un secteur est requis."),
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
      name: company.name,
      address: company.address,
      email: company.email,
      sectors: company.sectors,
    },
  });

  const sectorWatch = watch("sectors");
  const toggleSector = (id: string, checked: boolean) => {
    const current = watch("sectors") || [];
    const updated = checked
      ? [...current, id]
      : current.filter((secteurId) => secteurId !== id);

    setValue("sectors", updated, { shouldValidate: true });
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateCompanyAdmin({
      id: company.id,
      name: data.name,
      email: data.email,
      address: data.address,
      sectors: data.sectors,
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
          <DialogTitle>Modifier l&apos;entreprise</DialogTitle>
          <DialogDescription>
            Vous pouvez changer les informations de l&apos;entreprise juste ici.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nom"
                name="name"
                type="text"
                defaultValue={company.name}
                register={register}
                error={errors.name}
                icon={<Icon src="user" />}
              />
              <FormField
                label="E-mail"
                name="email"
                type="email"
                defaultValue={company.email}
                register={register}
                error={errors.email}
                icon={<Icon src="mail" />}
              />
            </div>
            <FormField
              label="Adresse"
              name="address"
              type="text"
              defaultValue={company.address}
              register={register}
              error={errors.address}
              icon={<Icon src="map-pin" />}
            />
            <div className="flex flex-wrap gap-y-5">
              {sectors &&
                sectors.map((sector) => {
                  return (
                    <div
                      key={sector.id}
                      className="flex w-[50%] items-center gap-2"
                    >
                      <Checkbox
                        id={`sector-${sector.id}`}
                        checked={sectorWatch?.includes(sector.id)}
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
                })}
              {errors.sectors && (
                <p className="text-sm text-red-500">{errors.sectors.message}</p>
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
