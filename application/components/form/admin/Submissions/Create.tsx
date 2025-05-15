"use client";
import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { FetchOffers } from "@/app/admin/offers/page";
import { FetchStudent } from "@/app/admin/page";
import { createSubmissionAdmin } from "@/lib/actions/admin/submission";
import FileUpload from "../../FileUpload";
import SelectWithSearch from "../../SelectWithSearch";

function useStudents() {
  return useQuery({
    queryKey: ["students_admin"],
    queryFn: async (): Promise<FetchStudent> => {
      const response = await fetch(`/api/admin/students`);
      return await response.json();
    },
  });
}

function useOffers() {
  return useQuery({
    queryKey: ["offers_admin"],
    queryFn: async (): Promise<FetchOffers> => {
      const response = await fetch(`/api/admin/offers`);
      return await response.json();
    },
  });
}

export default function CreateSubmissionAdmin({
  refetch,
}: {
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    isError: isErrorStudents,
    data: students,
    isLoading: isLoadingStudents,
  } = useStudents();

  const {
    isError: isErrorOffers,
    data: offers,
    isLoading: isLoadingOffers,
  } = useOffers();

  const zodFormSchema = z.object({
    studentId: z.string().nonempty("L'élève est requis."),
    offerId: z.string().nonempty("L'offre est requise."),
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
      }),
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
    const response = await createSubmissionAdmin({
      studentId: data.studentId,
      offerId: data.offerId,
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
        <Button onClick={() => setIsOpen(true)}>Créer une candidature</Button>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Créer une nouvelle candidature</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <SelectWithSearch
              isLoading={isLoadingStudents}
              isError={isErrorStudents}
              id="studentId"
              label="Sélectionnez un élève"
              items={
                students &&
                students.map((student) => ({
                  value: student.id,
                  label: student.name + " " + student.firstName,
                }))
              }
              notFoundItem="Aucun élève trouvée"
              placeHolderSelect="Sélectionnez un élève"
              placeHolderInput="Recherchez un élève..."
              setValue={setValue}
              errorsForm={errors.studentId?.message}
            />

            <SelectWithSearch
              isLoading={isLoadingOffers}
              isError={isErrorOffers}
              id="offerId"
              label="Sélectionnez une offre de stage"
              items={
                offers &&
                offers
                  .filter(
                    (offer) => offer.status === "Available" && !offer.expired,
                  )
                  .map((offer) => ({
                    value: offer.id,
                    label: offer.title,
                  }))
              }
              notFoundItem="Aucune offre trouvée"
              placeHolderSelect="Sélectionnez une offre"
              placeHolderInput="Recherchez une offre..."
              setValue={setValue}
              errorsForm={errors.offerId?.message}
            />
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
              label={
                <p>
                  Lettre de motivation (PDF){" "}
                  <span className="text-red-500">*</span>
                </p>
              }
              text={"Ajoutez votre lettre de motivation"}
            />
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
