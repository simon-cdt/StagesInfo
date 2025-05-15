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
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { FetchStudentEvaluations } from "@/types/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/Icon";

function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: async (): Promise<FetchStudentEvaluations> => {
      const response = await fetch(`/api/submissions/evaluations`);
      return await response.json();
    },
  });
}

export default function Buy() {
  const { isError, data: evaluations, isLoading } = useRanking();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const filteredEvaluations = evaluations?.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      item.company.name.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full justify-between">
          <h1 className={"text-3xl font-bold"}>Mes évaluations de stage</h1>
          <Input
            type="text"
            placeholder="Rechercher une évaluation..."
            className="w-[20%] border-black/50"
            onChange={(e) => setSearch(e.target.value)}
            value={search || ""}
          />
        </div>
        {isLoading ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : filteredEvaluations !== undefined &&
          filteredEvaluations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date de l&apos;évaluations</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell className="text-md font-semibold">
                    {stage.title}
                  </TableCell>
                  <TableCell>{stage.company.name}</TableCell>
                  <TableCell>
                    {stage.evaluation
                      ? `${stage.evaluation.rating}/5`
                      : "Aucune note encore attribuée"}
                  </TableCell>
                  <TableCell>
                    {stage.evaluation
                      ? format(stage.evaluation.date, "PPP", { locale: fr })
                      : "Aucune date"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-bold">{`${stage.company.contact.firstName} ${stage.company.contact.name}`}</p>
                      <div className="flex items-center gap-1">
                        <Icon src="mail" />
                        <p className="text-sm">{stage.company.contact.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.evaluation ? (
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
                              Commentaire du maître de stage
                            </DialogTitle>
                          </DialogHeader>
                          <div>
                            <p className="text-sm whitespace-pre-line">
                              {stage.evaluation.comment}
                            </p>
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
                          <Icon src="page" />
                          <p>Voir les détails</p>
                        </div>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex">
            {search !== "" ? (
              <p className="font-semibold">
                Votre filtre ne correspond à aucune de vos évaluations.
              </p>
            ) : (
              <>
                <p>Vous n&apos;avez pas encore d&apos;évaluation de stage.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
