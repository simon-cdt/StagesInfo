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
import { rejectSubmission } from "@/lib/actions/submission";

export default function RejectCompany({
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
          className="bg-transparent shadow-none hover:bg-red-200"
        >
          <Icon src="xmark-red" className="w-6" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir refuser cette candidature ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Vous pouvez toujours accepter
            la candidature plus tard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            onClick={async () => {
              setIsLoading(true);
              const response = await rejectSubmission({ id });
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
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirmer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
