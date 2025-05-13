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
import { noterEleve, updateEvaluation } from "@/lib/actions/evaluation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Icon from "./Icon";

const zodFormSchema = z.object({
  note: z.string().refine((val) => ["1", "2", "3", "4", "5"].includes(val), {
    message: "Veuillez sélectionner une note entre 1 et 5.",
  }),
  comment: z.string().min(1, "Le commentaire est requis."),
});
type FormSchema = z.infer<typeof zodFormSchema>;

export default function RateDialog({
  id,
  idStage,
  defaultValue,
  refetch,
}: {
  id?: string;
  idStage: string;
  defaultValue: { id: string; note: number; comment: string } | null;
  refetch: () => void;
}) {
  const update = !!defaultValue;

  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
    defaultValues: {
      note: defaultValue?.note?.toString() ?? "",
      comment: defaultValue?.comment ?? "",
    },
  });

  const note = watch("note");

  const onSubmit = async (data: FormSchema) => {
    if (update) {
      const response = await updateEvaluation({
        id: id ? id : "",
        note: data.note,
        commentaire: data.comment,
      });
      if (response.success) {
        setIsOpen(false);
        toast.success(response.message);
        refetch();
      } else {
        setIsOpen(false);
        toast.error(response.message);
      }
    } else {
      const response = await noterEleve({
        idStage,
        note: data.note,
        commentaire: data.comment,
      });
      if (response.success) {
        setIsOpen(false);
        toast.success(response.message);
        refetch();
      } else {
        setIsOpen(false);
        toast.error(response.message);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {update ? (
            <div className="flex items-center gap-2">
              <Icon src={"page-edit"} />
              <p>Modifier l&apos;évaluation</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Icon src={"star"} />
              <p>Notez l&apos;élève</p>
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {update ? "Modifier l'évaluation" : "Notez l'élève"}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-4">
              <div>
                <fieldset className="flex flex-col gap-2">
                  <Label className="text-foreground leading-none">
                    Notez de 1 à 5
                  </Label>
                  <RadioGroup
                    value={note}
                    onValueChange={(value) =>
                      setValue("note", value, { shouldValidate: true })
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
                  {errors.note && (
                    <span className="mt-1 text-sm text-red-500">
                      {errors.note.message}
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : update ? (
                "Mettre à jour"
              ) : (
                "Évaluer l'élève"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
