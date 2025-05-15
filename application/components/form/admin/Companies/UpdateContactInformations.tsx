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
import toast from "react-hot-toast";
import { updateCompanyContactAdmin } from "@/lib/actions/admin/company";
import { useState } from "react";

export default function UpdateCompanyContactInformationsAdminForm({
  contact,
  refetch,
}: {
  contact: {
    id: string;
    name: string;
    firstName: string;
    email: string;
  };
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);

  const zodFormSchema = z.object({
    name: z.string().nonempty("Le nom est requis."),
    firstName: z.string().nonempty("Le preénom est requis."),
    email: z
      .string()
      .email("L'email doit être valide.")
      .nonempty("L'e-mail est requis."),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      name: contact.name,
      firstName: contact.firstName,
      email: contact.email,
    },
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateCompanyContactAdmin({
      id: contact.id,
      name: data.name,
      firstName: data.firstName,
      email: data.email,
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
            <p>Modifier le contact</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Modifier le contact de l&apos;entreprise</DialogTitle>
          <DialogDescription>
            Vous pouvez changer les informations du contact de l&apos;entreprise
            juste ici.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nom"
                name="name"
                type="text"
                register={register}
                error={errors.name}
                icon={<Icon src="user" />}
              />
              <FormField
                label="Preénom"
                name="firstName"
                type="text"
                register={register}
                error={errors.firstName}
                icon={<Icon src="map-pin" />}
              />
            </div>
            <FormField
              label="E-mail"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              icon={<Icon src="mail" />}
            />

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
