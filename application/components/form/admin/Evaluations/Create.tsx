"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Icon from "@/components/Icon";
import { CreateRatingStudentAdmin } from "@/lib/actions/admin/evaluation";
import { useQuery } from "@tanstack/react-query";
import { FetchStudent } from "@/app/admin/page";
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

type FetchOffers = [
  {
    id: string;
    title: string;
  },
];

function useOffers({ idStudent }: { idStudent: string }) {
  return useQuery({
    queryKey: ["offers_finished_admin", idStudent],
    queryFn: async (): Promise<FetchOffers> => {
      const response = await fetch(`/api/admin/evaluations/${idStudent}`);
      return await response.json();
    },
    enabled: !!idStudent,
  });
}

export default function CreateRateDialogAdminForm({
  refetch,
}: {
  refetch: () => void;
}) {
  const {
    isLoading: isLoadingStudents,
    data: students,
    isError: isErrorStudents,
  } = useStudents();

  const [isOpen, setIsOpen] = useState(false);

  const zodFormSchema = z.object({
    studentId: z.string().nonempty("Sélectionnez un étudiant."),
    offerId: z.string().nonempty("Sélectionnez une offre."),
    rating: z
      .string()
      .refine((val) => ["1", "2", "3", "4", "5"].includes(val), {
        message: "Veuillez sélectionner une note entre 1 et 5.",
      }),
    comment: z.string().min(1, "Le commentaire est requis."),
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
  });

  const studentId = watch("studentId");
  const note = watch("rating");

  const {
    data: offers,
    isLoading: isLoadingOffers,
    isError: isErrorOffers,
    refetch: refetchOffers,
  } = useOffers({
    idStudent: studentId,
  });

  const onSubmit = async (data: FormSchema) => {
    const response = await CreateRatingStudentAdmin({
      offerId: data.offerId,
      rating: data.rating,
      comment: data.comment,
    });
    if (response.success) {
      toast.success("L'évaluation a été crée avec succès.");
      refetch();
      refetchOffers();
      setIsOpen(false);
    } else {
      toast.error(response.message);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <div className="flex items-center gap-2">
            <Icon src={"page-edit"} />
            <p>Créer une évaluation de stage</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Créer une évaluation de stage
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-4">
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
                  offers.map((offer) => ({
                    value: offer.id,
                    label: offer.title,
                  }))
                }
                notFoundItem="Aucun offre trouvée"
                placeHolderSelect="Sélectionnez une offre"
                placeHolderInput="Recherchez une offre..."
                setValue={setValue}
                errorsForm={errors.offerId?.message}
              />

              <div>
                <fieldset className="flex flex-col gap-2">
                  <Label className="text-foreground leading-none">
                    Notez de 1 à 5
                  </Label>
                  <RadioGroup
                    value={note}
                    onValueChange={(value) =>
                      setValue("rating", value, { shouldValidate: true })
                    }
                    className="flex gap-0 -space-x-px rounded-md shadow-xs"
                  >
                    {[1, 2, 3, 4, 5].map((number) => (
                      <label
                        key={number}
                        className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm transition-[color,box-shadow] outline-none first:rounded-s-md last:rounded-e-md has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 has-data-[state=checked]:z-10"
                      >
                        <RadioGroupItem
                          value={number.toString()}
                          className="sr-only after:absolute after:inset-0"
                        />
                        {number}
                      </label>
                    ))}
                  </RadioGroup>
                  {errors.rating && (
                    <span className="mt-1 text-sm text-red-500">
                      {errors.rating.message}
                    </span>
                  )}
                </fieldset>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="feedback">Commentaire</Label>
                <Textarea
                  id="feedback"
                  className="min-h-20"
                  placeholder="Décrivez ce que vous avez pensé de l'élève"
                  {...register("comment")}
                />
                {errors.comment && (
                  <span className="text-sm text-red-500">
                    {errors.comment.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant={"outline"}
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Fermer
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Créer"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
