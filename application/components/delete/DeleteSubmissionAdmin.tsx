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
import Icon from "../Icon";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { deleteSubmissionAdmin } from "@/lib/actions/admin/submission";

export default function DeleteSubmissionAdmin({
  id,
  refetch,
}: {
  id: string;
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoadingFetch, setIsLoading] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"destructive"}>
          <div className="flex items-center gap-1">
            <Icon src="trash" />
            <p>Supprimer</p>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous vraiment sûr de supprimer l&apos;offre de stage ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Vous ne pourrez pas récupérer
            l&apos;offre de stage une fois supprimée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="pointer">Annuler</AlertDialogCancel>
          <Button
            className="pointer pointer bg-red-500 text-white hover:bg-red-600 hover:text-white"
            onClick={async () => {
              setIsLoading(true);
              const response = await deleteSubmissionAdmin({
                id,
              });
              if (!response.success) {
                setOpen(false);
                setIsLoading(false);
                toast.error(response.message);
              } else {
                setOpen(false);
                setIsLoading(false);
                toast.success(response.message);
                refetch();
              }
            }}
            disabled={isLoadingFetch}
          >
            {isLoadingFetch ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirmer"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
