"use client";

import { FormField } from "@/components/form/FormField";
import Icon from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateCompanyContact } from "@/lib/actions/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function UpdateCompanyContactInformationsForm({
  contact,
}: {
  contact: {
    name: string;
    firstName: string;
    email: string;
  };
}) {
  const router = useRouter();

  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    firstName: z.string().nonempty("Le prénom est requis."),
    email: z
      .string()
      .nonempty("L'e-mail est requis")
      .email("L'e-mail est invalide."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateCompanyContact({
      name: data.name,
      firstName: data.firstName,
      email: data.email,
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
            Modifier les informatins du contact de l&apos;entreprise
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
                  defaultValue={contact.name}
                  register={register}
                  error={errors.name}
                  icon={<Icon src="user" />}
                />
                <FormField
                  label="Prénom"
                  name="firstName"
                  type="text"
                  defaultValue={contact.firstName}
                  register={register}
                  error={errors.firstName}
                  icon={<Icon src="user" />}
                />
              </div>
              <FormField
                label="E-mail"
                name="email"
                type="email"
                defaultValue={contact.email}
                register={register}
                error={errors.email}
                icon={<Icon src="mail" />}
              />
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
