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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { FetchCandidatures } from "@/types/types";
import { Button } from "@/components/ui/button";
import { RetirerCandidature } from "@/lib/actions/candidature";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function useCandidatures() {
  return useQuery({
    queryKey: ["candidatures"],
    queryFn: async (): Promise<FetchCandidatures> => {
      const response = await fetch(`/api/candidatures`);
      return await response.json();
    },
  });
}

export default function Candidatures() {
  const { isError, data: candidatures, isLoading, refetch } = useCandidatures();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [tabs, setTabs] = useQueryState(
    "tabs",
    parseAsString.withDefault("all"),
  );

  const candidaturesFiltrees = candidatures
    ?.filter((item) => {
      const searchTerm = search.toLowerCase();
      return (
        item.stage.titre.toLowerCase().includes(searchTerm) ||
        item.stage.entreprise.nom.toLowerCase().includes(searchTerm)
      );
    })
    ?.filter((item) => {
      if (tabs === "all") return true;
      if (tabs === "wait") return item.statut === "EnAttente";
      if (tabs === "accepted") return item.statut === "Acceptée";
      if (tabs === "refused") return item.statut === "Refusée";
      return true;
    });

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case "EnAttente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      case "Acceptée":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "Refusée":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const handleRetirerCandidature = async ({ id }: { id: string }) => {
    const response = await RetirerCandidature({ id });

    if (response.success) {
      toast.success(response.message);
      refetch();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full justify-between">
          <h1 className={"text-3xl font-bold"}>Mes candidatures</h1>
          <Input
            type="text"
            placeholder="Rechercher une candidature..."
            className="w-[20%] border-black/50"
            onChange={(e) => setSearch(e.target.value)}
            value={search || ""}
          />
        </div>
        <Tabs value={tabs} onValueChange={setTabs} className="w-[600px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="wait">En attente</TabsTrigger>
            <TabsTrigger value="accepted">Acceptées</TabsTrigger>
            <TabsTrigger value="refused">Refusées</TabsTrigger>
          </TabsList>
        </Tabs>
        {isLoading ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : candidaturesFiltrees && candidaturesFiltrees.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead className="text-left">
                    Lettre de motivation
                  </TableHead>
                  <TableHead>Date de postulation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidaturesFiltrees.map((candidature) => (
                  <TableRow key={candidature.id}>
                    <TableCell className="text-md font-semibold underline">
                      <Link href={`/stage/${candidature.stage.id}`}>
                        {candidature.stage.titre}
                      </Link>
                    </TableCell>
                    <TableCell>{candidature.stage.entreprise.nom}</TableCell>
                    <TableCell>
                      <Link
                        href={`/etudiant/cv/${candidature.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="best-transition border-2 border-black/30 bg-transparent text-black hover:bg-white">
                          Lien
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell className="flex justify-start">
                      <Link
                        href={`/etudiant/${candidature.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="best-transition border-2 border-black/30 bg-transparent text-black hover:bg-white">
                          Lien
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(candidature.date, "PPP", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeClass(candidature.statut)}
                      >
                        {candidature.statut === "EnAttente"
                          ? "En attente"
                          : candidature.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {candidature.statut === "EnAttente" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              Retirer la candidature
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Êtes vous certain de vouloir faire cette action
                                ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L&apos;entreprise
                                ne pourra plus voir votre candidature.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="best-transition bg-red-500 text-white hover:bg-red-600"
                                onClick={() =>
                                  handleRetirerCandidature({
                                    id: candidature.id,
                                  })
                                }
                              >
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button variant={"disable"} disabled>
                          Retirer la candidature
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="flex">
            {candidatures && candidatures.length > 0 ? (
              <p className="font-semibold">
                Votre filtre ne correspond à aucune de vos candidatures.
              </p>
            ) : (
              <>
                <p>Vous n&apos;avez encore aucune candidatures,&nbsp;</p>
                <Link href={"/"} className="font-semibold underline">
                  cliquez ici pour aller en faire.
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
