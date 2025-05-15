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
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Icon from "@/components/Icon";
import { updateSubmissionAdmin } from "@/lib/actions/admin/submission";
import FileUpload from "../../FileUpload";

export default function UpdateSubmissionAdminForm({
  id,
  refetch,
  disabled,
}: {
  id: string;
  disabled: boolean;
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const zodFormSchema = z.object({
    resume: z
      .custom<File>()
      .refine((val) => val?.type === "application/pdf", {
        message: "Le fichier doit être au format PDF.",
      })
      .optional(),
    motivationLetter: z
      .custom<File>()
      .refine((val) => val?.type === "application/pdf", {
        message: "Le fichier doit être au format PDF.",
      })
      .optional(),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (data: FormSchema) => {
    const response = await updateSubmissionAdmin({
      id,
      resume: data.resume,
      motivationLetter: data.motivationLetter,
    });

    if (response.success) {
      toast.success(response.message);
      setIsOpen(false);
      refetch();
    } else {
      toast.error(response.message);
      setIsOpen(false);
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
            <DialogTitle>Modifier la candidature</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FileUpload
              errorsForm={errors.resume?.message}
              setValue={setValue}
              id="resume"
              label={<>CV (PDF)</>}
              text="Ajoutez votre CV"
            />
            <FileUpload
              errorsForm={errors.motivationLetter?.message}
              setValue={setValue}
              id="motivationLetter"
              label={<>Lettre de motivation (PDF)</>}
              text="Ajoutez votre lettre de motivation"
            />
            <p className="text-sm text-black/70">
              Si un des fichiers n&apos;est pas téléchargé, il ne sera pas
              modifié.
            </p>
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
