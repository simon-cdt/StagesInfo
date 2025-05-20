import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { deleteRate } from "@/lib/actions/evaluation";
import { Loader2 } from "lucide-react";

export default function DeleteEvaluationCompany({
  id,
  refetch,
}: {
  id: string;
  refetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          Supprimer l&apos;évaluation de stage
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes vous certain de vouloir faire cette action ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Vous ne pourrez pas récupérer
            l&apos;évaluation de stage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            className="best-transition bg-red-500 text-white hover:bg-red-600"
            onClick={async () => {
              setIsLoading(true);
              const response = await deleteRate({ id });
              if (response.success) {
                setIsLoading(false);
                setIsOpen(false);
                toast.success(response.message);
                refetch();
              } else {
                setIsLoading(false);
                setIsOpen(false);
                toast.error(response.message);
              }
            }}
            variant={"destructive"}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              "Confirmer"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
