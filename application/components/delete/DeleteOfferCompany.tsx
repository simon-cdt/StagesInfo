"use client";
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
import { Loader2 } from "lucide-react";
import { deleteOffer } from "@/lib/actions/company";
import toast from "react-hot-toast";

export default function DeleteOfferCompany({
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
          <div className="flex items-center gap-2">
            <Icon src="trash" className="w-4" />
            <p>Supprimer</p>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes vous certain de vouloir faire cette action ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L&apos;entreprise ne pourra plus voir
            votre candidature.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            className="best-transition bg-red-500 text-white hover:bg-red-600"
            onClick={async () => {
              setIsLoading(true);
              const response = await deleteOffer({ id });
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
            disabled={isLoading}
            variant={isLoading ? "disable" : "destructive"}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirmer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
