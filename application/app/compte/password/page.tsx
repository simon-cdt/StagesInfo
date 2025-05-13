"use client";

import PasswordConditionsField from "@/components/form/PasswordConditionsField";
import PasswordField from "@/components/form/PasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updatePassword } from "@/lib/actions/general";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function ModifyPassword() {
  const router = useRouter();

  const zodFormSchema = z
    .object({
      mdpActuel: z
        .string()
        .nonempty({ message: "Le mot de passe actuel est requis" }),
      nvMdp: z
        .string()
        .nonempty()
        .min(8)
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).+$/),
      confirmeNvMdp: z.string().nonempty({
        message: "La confirmation du nouveau mot de passe est requise.",
      }),
    })
    .refine((data) => data.nvMdp === data.confirmeNvMdp, {
      path: ["confirmeNvMdp"],
      message: "Les mots de passe ne correspondent pas.",
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

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updatePassword({
      mdpActuel: data.mdpActuel,
      nvMdp: data.nvMdp,
    });

    if (response.success) {
      toast.success(response.message);
      await signOut({ redirect: false });
      router.push("/login");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex w-full justify-center pt-10">
      <div className="flex w-[80%] flex-col items-center justify-start gap-10">
        <div className="flex w-[700px] justify-start">
          <h1 className={"text-left text-3xl font-bold"}>
            Modifier mon mot de passe
          </h1>
        </div>
        <Card className="flex w-[700px] flex-col gap-1">
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <CardContent className="flex flex-col gap-6 px-6">
              <PasswordField
                id="mdpActuel"
                register={register}
                label="Mot de passe actuel"
                errorsForm={errors.mdpActuel?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <PasswordConditionsField
                  id="nvMdp"
                  setValue={setValue}
                  label="Nouveau mot de passe"
                />
                <PasswordField
                  id="confirmeNvMdp"
                  register={register}
                  label="Confirmation du nouveau mot de passe"
                  errorsForm={errors.confirmeNvMdp?.message}
                />
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
                  "Changer de mot de passe"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
