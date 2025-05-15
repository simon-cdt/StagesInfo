"use client";

import { FormField } from "@/components/form/FormField";
import Icon from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateCompany } from "@/lib/actions/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function UpdateCompanyInformationsForm({
  company,
  sectors,
}: {
  company: {
    name: string;
    address: string;
    email: string;
  };
  sectors: {
    id: string;
    label: string;
    checked: boolean;
  }[];
}) {
  const router = useRouter();

  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    address: z.string().nonempty("L'adresse est requise."),
    email: z
      .string()
      .nonempty("L'e-mail est requis")
      .email("L'e-mail est invalide."),
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
      sectors: sectors
        .filter((sector) => sector.checked)
        .map((sector) => sector.id),
    },
  });

  const sectorWatch = watch("sectors");
  const toggleSector = (id: string, checked: boolean) => {
    const current = watch("sectors") || [];
    const updated = checked
      ? [...current, id]
      : current.filter((sectorId) => sectorId !== id);

    setValue("sectors", updated, { shouldValidate: true });
  };

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateCompany({
      name: data.name,
      email: data.email,
      address: data.address,
      sectors: data.sectors,
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
                {sectors.map((sector) => {
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
                  <p className="text-sm text-red-500">
                    {errors.sectors.message}
                  </p>
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
