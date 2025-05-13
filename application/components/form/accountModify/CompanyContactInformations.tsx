"use client";

import { FormField } from "@/components/form/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { modifierContactEntreprise } from "@/lib/actions/entreprise";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function FormModifyCompanyContactInformations({
  contact,
}: {
  contact: {
    nom: string;
    prenom: string;
    email: string;
  };
}) {
  const router = useRouter();

  const zodFormSchema = z.object({
    nom: z.string().nonempty("Le nom est requis."),
    prenom: z.string().nonempty("Le prénom est requis."),
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
    const response = await modifierContactEntreprise({
      nom: data.nom,
      prenom: data.prenom,
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
                  name="nom"
                  type="text"
                  defaultValue={contact.nom}
                  register={register}
                  error={errors.nom}
                  icon={
                    <Image
                      src={"/icon/user.svg"}
                      alt="Icon"
                      width={700}
                      height={700}
                      className="w-4"
                    />
                  }
                />
                <FormField
                  label="Prénom"
                  name="prenom"
                  type="text"
                  defaultValue={contact.prenom}
                  register={register}
                  error={errors.prenom}
                  icon={
                    <Image
                      src={"/icon/user.svg"}
                      alt="Icon"
                      width={700}
                      height={700}
                      className="w-4"
                    />
                  }
                />
              </div>
              <FormField
                label="E-mail"
                name="email"
                type="email"
                defaultValue={contact.email}
                register={register}
                error={errors.email}
                icon={
                  <Image
                    src={"/icon/mail.svg"}
                    alt="Icon"
                    width={700}
                    height={700}
                    className="w-4"
                  />
                }
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
