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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/Icon";
import UpdateRateDialogAdminForm from "@/components/form/admin/Evaluations/Update";
import CreateRateDialogAdminForm from "@/components/form/admin/Evaluations/Create";
import DeleteEvaluationAdmin from "@/components/delete/DeleteEvaluationAdmin";

type FetchEvaluations = {
  id: string;
  rating: number;
  comment: string;
  date: Date;
  offer: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
  student: {
    id: string;
    firstName: string;
    name: string;
  };
}[];

function useEvaluations() {
  return useQuery({
    queryKey: ["evaluations_admin"],
    queryFn: async (): Promise<FetchEvaluations> => {
      const response = await fetch(`/api/admin/evaluations`);
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

  const filteredEvaluations = evaluations?.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.student.name.toLowerCase().includes(searchTerm) ||
      item.student.firstName.toLowerCase().includes(searchTerm) ||
      item.offer.title.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="flex w-full flex-col items-center pt-10">
      <div className="flex w-[90%] flex-col gap-7">
        <div className="flex flex-col justify-between gap-3">
          <h1 className={"text-3xl font-bold"}>Les évaluations de stage</h1>
          <div className="flex w-full justify-between">
            <CreateRateDialogAdminForm refetch={refetch} />
            <Input
              type="text"
              placeholder="Rechercher un élève ou un stage..."
              className="w-[20%] border-black/50"
              onChange={(e) => setSearch(e.target.value)}
              value={search || ""}
            />
          </div>
        </div>
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
                <TableHead>Modifier</TableHead>
                <TableHead className="text-right">Supprimer</TableHead>
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
                    </TableCell>
                    <TableCell>
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
                                {evaluation.rating}/5
                              </p>
                            </div>
                            <Separator />
                            <div className="flex flex-col gap-1">
                              <p className="text-black/70">Commentaire :</p>
                              <p className="whitespace-pre-line">
                                {evaluation.comment}
                              </p>
                            </div>
                            <Separator />
                            <div className="flex gap-1">
                              <p className="text-black/70">
                                Date de l&apos;évaluation :
                              </p>
                              <p className="font-semibold">
                                {format(evaluation.date, "PPP", { locale: fr })}
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
                    </TableCell>
                    <TableCell>
                      <UpdateRateDialogAdminForm
                        id={evaluation.id}
                        refetch={refetch}
                        defaultValue={{
                          rating: evaluation.rating,
                          comment: evaluation.comment,
                          id: evaluation.id,
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteEvaluationAdmin
                        id={evaluation.id}
                        refetch={refetch}
                      />
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
