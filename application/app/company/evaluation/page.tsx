"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { FetchCompanyOfferEvaluations } from "@/types/types";
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
import DeleteEvaluationCompany from "@/components/delete/DeleteEvaluationCompany";

function useEvaluations() {
  return useQuery({
    queryKey: ["evaluationsCompany"],
    queryFn: async (): Promise<FetchCompanyOfferEvaluations> => {
      const response = await fetch(`/api/company/evaluations`);
      return await response.json();
    },
  });
}

export default function OffreStageScreen() {
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

  const filteredEvaluations = evaluations
    ?.filter((item) => {
      const searchTerm = search.toLowerCase();
      return (
        item.student.name.toLowerCase().includes(searchTerm) ||
        item.student.firstName.toLowerCase().includes(searchTerm) ||
        item.offer.title.toLowerCase().includes(searchTerm)
      );
    })
    ?.filter((item) => {
      if (tabs === "all") return true;
      if (tabs === "Déjà noté") return item.offer.evaluation !== null;
      if (tabs === "Pas encore noté") return item.offer.evaluation === null;
      return true;
    });

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
        ) : filteredEvaluations && filteredEvaluations.length > 0 ? (
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
              {filteredEvaluations.map((evaluation) => {
                return (
                  <TableRow key={evaluation.id}>
                    <TableCell className="text-md font-semibold underline">
                      <Link href={`/stage/${evaluation.id}`}>
                        {evaluation.offer.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{`${evaluation.student.firstName} ${evaluation.student.name}`}</p>
                      <div className="flex items-center gap-2">
                        <Icon src={"mail"} />
                        <p>{evaluation.student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {evaluation.offer.evaluation ? (
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
                                  {evaluation.offer.evaluation.rating}/5
                                </p>
                              </div>
                              <Separator />
                              <div className="flex flex-col gap-1">
                                <p className="text-black/70">Commentaire :</p>
                                <p className="whitespace-pre-line">
                                  {evaluation.offer.evaluation.comment}
                                </p>
                              </div>
                              <Separator />
                              <div className="flex gap-1">
                                <p className="text-black/70">
                                  Date de l&apos;évaluation :
                                </p>
                                <p className="font-semibold">
                                  {format(
                                    evaluation.offer.evaluation.date,
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
                      {evaluation.offer.evaluation ? (
                        <DeleteEvaluationCompany
                          id={evaluation.offer.evaluation.id}
                          refetch={refetch}
                        />
                      ) : (
                        <Button variant={"disable"} disabled>
                          Supprimer l&apos;offre de stage
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {evaluation.offer.evaluation ? (
                        <RateDialog
                          id={evaluation.offer.evaluation.id}
                          refetch={refetch}
                          offerId={evaluation.offer.id}
                          defaultValue={{
                            rating: evaluation.offer.evaluation.rating,
                            comment: evaluation.offer.evaluation.comment,
                            id: evaluation.offer.evaluation.id,
                          }}
                        />
                      ) : (
                        <RateDialog
                          refetch={refetch}
                          offerId={evaluation.offer.id}
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
