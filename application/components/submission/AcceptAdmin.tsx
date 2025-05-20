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
import { acceptSubmissionAdmin } from "@/lib/actions/admin/submission";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function AcceptAdmin({
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
        <Button
          size={"icon"}
          className="bg-transparent shadow-none hover:bg-emerald-200"
        >
          <Icon src="check-green" className="w-6" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir accepter cette candidature ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Vous ne pourrez pas récupérer
            la candidature une fois acceptée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={async () => {
              setIsLoading(true);
              const response = await acceptSubmissionAdmin({ id });
              if (response.success) {
                toast.success(response.message);
                setIsLoading(false);
                setIsOpen(false);
                refetch();
              } else {
                toast.error(response.message);
                setIsLoading(false);
                setIsOpen(false);
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
