import Icon from "@/components/Icon";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteOfferAdmin } from "@/lib/actions/admin/offer";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function DeleteOfferAdmin({
  refetch,
  offerId,
}: {
  refetch: () => void;
  offerId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
              const response = await deleteOfferAdmin({
                id: offerId,
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
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirmer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
