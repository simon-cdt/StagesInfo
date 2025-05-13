"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { FetchEvaluationEntreprise } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RateDialog from "@/components/RateDialog";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/Icon";
import { deleteEvaluation } from "@/lib/actions/evaluation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

function useEvaluations() {
  return useQuery({
    queryKey: ["offresEntreprise"],
    queryFn: async (): Promise<FetchEvaluationEntreprise> => {
      const response = await fetch(`/api/entreprise/evaluation`);
      return await response.json();
    },
  });
}

export default function OffreStageScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isError,
    data: evaluations,
    isLoading: isLoadingEvaluations,
    refetch,
  } = useEvaluations();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [tabs, setTabs] = useQueryState(
    "tabs",
    parseAsString.withDefault("all"),
  );

  const evaluationsFiltrees = evaluations
    ?.filter((item) => {
      const searchTerm = search.toLowerCase();
      return (
        item.etudiant.nom.toLowerCase().includes(searchTerm) ||
        item.etudiant.prenom.toLowerCase().includes(searchTerm) ||
        item.stage.titre.toLowerCase().includes(searchTerm)
      );
    })
    ?.filter((item) => {
      if (tabs === "all") return true;
      if (tabs === "Déjà noté") return item.stage.evaluation !== null;
      if (tabs === "Pas encore noté") return item.stage.evaluation === null;
      return true;
    });

  const handleSupprimerEvaluation = async ({ id }: { id: string }) => {
    setIsLoading(true);
    const response = await deleteEvaluation({ id });
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
  };

  return (
    <div className="flex w-full flex-col items-center pt-10">
      <div className="flex w-[90%] flex-col gap-7">
        <div className="flex w-full justify-between">
          <h1 className={"text-3xl font-bold"}>Les évaluations de stage</h1>
          <Input
            type="text"
            placeholder="Rechercher un élève ou un stage..."
            className="w-[20%] border-black/50"
            onChange={(e) => setSearch(e.target.value)}
            value={search || ""}
          />
        </div>
        <Tabs
          value={tabs}
          onValueChange={setTabs}
          className="w-[600px] max-w-fit"
        >
          <TabsList className="flex w-fit gap-10">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="Déjà noté">Déjà noté</TabsTrigger>
            <TabsTrigger value="Pas encore noté">Pas encore noté</TabsTrigger>
          </TabsList>
        </Tabs>
        {isLoadingEvaluations ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : evaluationsFiltrees && evaluationsFiltrees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Elève</TableHead>
                <TableHead>Voir l&apos;évaluation</TableHead>
                <TableHead>Supprimer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationsFiltrees.map((evaluation) => {
                return (
                  <TableRow key={evaluation.id}>
                    <TableCell className="text-md font-semibold underline">
                      <Link href={`/stage/${evaluation.id}`}>
                        {evaluation.stage.titre}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{`${evaluation.etudiant.prenom} ${evaluation.etudiant.nom}`}</p>
                      <div className="flex items-center gap-2">
                        <Icon src={"mail"} />
                        <p>{evaluation.etudiant.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {evaluation.stage.evaluation ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <div className="flex items-center gap-2">
                                <Icon src="page" />
                                <p>Voir les détails</p>
                              </div>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Détails de l&apos;évaluation
                              </DialogTitle>
                            </DialogHeader>
                            <Separator />
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-1">
                                <p className="text-black/70">Note :</p>
                                <p className="font-semibold">
                                  {evaluation.stage.evaluation.note}/5
                                </p>
                              </div>
                              <Separator />
                              <div className="flex flex-col gap-1">
                                <p className="text-black/70">Commentaire :</p>
                                <p className="whitespace-pre-line">
                                  {evaluation.stage.evaluation.commentaire}
                                </p>
                              </div>
                              <Separator />
                              <div className="flex gap-1">
                                <p className="text-black/70">
                                  Date de l&apos;évaluation :
                                </p>
                                <p className="font-semibold">
                                  {format(
                                    evaluation.stage.evaluation.date,
                                    "PPP",
                                    { locale: fr },
                                  )}
                                </p>
                              </div>
                              <Separator />
                            </div>
                            <DialogFooter className="sm:justify-start">
                              <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                  Fermer
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button disabled variant={"disable"}>
                          <div className="flex items-center gap-2">
                            <Icon src={"page"} />
                            <p>Voir les détails</p>
                          </div>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {evaluation.stage.evaluation ? (
                        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              Supprimer l&apos;évaluation de stage
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Êtes vous certain de vouloir faire cette action
                                ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Vous ne pourrez
                                pas récupérer l&apos;évaluation de stage.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <Button
                                className="best-transition bg-red-500 text-white hover:bg-red-600"
                                onClick={() =>
                                  handleSupprimerEvaluation({
                                    id: evaluation.stage.evaluation?.id || "",
                                  })
                                }
                                variant={"destructive"}
                                type="button"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" />
                                  </div>
                                ) : (
                                  "Supprimer l'évaluation de stage"
                                )}
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button variant={"disable"} disabled>
                          Supprimer l&apos;offre de stage
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {evaluation.stage.evaluation ? (
                        <RateDialog
                          id={evaluation.stage.evaluation.id}
                          refetch={refetch}
                          idStage={evaluation.stage.id}
                          defaultValue={{
                            note: evaluation.stage.evaluation.note,
                            comment: evaluation.stage.evaluation.commentaire,
                            id: evaluation.stage.evaluation.id,
                          }}
                        />
                      ) : (
                        <RateDialog
                          refetch={refetch}
                          idStage={evaluation.stage.id}
                          defaultValue={null}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex">
            {evaluations && evaluations.length > 0 ? (
              <p className="font-semibold">
                Votre filtre ne correspond à aucune de vos évaluations.
              </p>
            ) : (
              <p>Vous n&apos;avez pas encore évaluer aucun stage.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
