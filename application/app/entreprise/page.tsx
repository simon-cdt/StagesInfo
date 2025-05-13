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
import { colorMap, FetchOffresEntreprise } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import StageModify from "@/components/form/companyModify/StageModify";
import { supprimerOffreStage } from "@/lib/actions/entreprise";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import StageCreate from "@/components/form/companyModify/StageCreate";
import Icon from "@/components/Icon";

function useOffres() {
  return useQuery({
    queryKey: ["offresEntreprise"],
    queryFn: async (): Promise<FetchOffresEntreprise> => {
      const response = await fetch(`/api/entreprise/offres`);
      return await response.json();
    },
  });
}

export default function OffreStageScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isError,
    data: offres,
    isLoading: isLoadingOffer,
    refetch,
  } = useOffres();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [tabs, setTabs] = useQueryState(
    "tabs",
    parseAsString.withDefault("all"),
  );

  const offreFiltrees = offres
    ?.filter((item) => {
      const searchTerm = search.toLowerCase();
      return item.titre.toLowerCase().includes(searchTerm);
    })
    ?.filter((item) => {
      if (tabs === "all") return true;
      if (tabs === "available") return item.statut === "Disponible";
      if (tabs === "completed") return item.statut === "Pourvue";
      if (tabs === "expired") return item.statut === "Expirée";
      return true;
    });

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case "Disponible":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Pourvue":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "Expirée":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const handleSupprimerOffreStage = async ({ id }: { id: string }) => {
    setIsLoading(true);
    const response = await supprimerOffreStage({ id });
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
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-7">
        <div className="flex w-full flex-col gap-5">
          <h1 className={"text-3xl font-bold"}>Les offres de stage</h1>
          <div className="flex items-center justify-between">
            <StageCreate refetch={refetch} />
            <Input
              type="text"
              placeholder="Rechercher une offre..."
              className="w-[20%] border-black/50"
              onChange={(e) => setSearch(e.target.value)}
              value={search || ""}
            />
          </div>
        </div>
        <Tabs value={tabs} onValueChange={setTabs} className="w-[600px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="available">Disponible</TabsTrigger>
            <TabsTrigger value="completed">Pourvue</TabsTrigger>
            <TabsTrigger value="expired">Expirée</TabsTrigger>
          </TabsList>
        </Tabs>
        {isLoadingOffer ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : offreFiltrees && offreFiltrees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Détails du stage</TableHead>
                <TableHead>Candidatures</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Modifier</TableHead>
                <TableHead className="text-right">Supprimer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offreFiltrees.map((stage) => {
                const color = colorMap[stage.secteur.couleur] || colorMap.blue;
                return (
                  <TableRow key={stage.id}>
                    <TableCell className="text-md font-semibold underline">
                      <Link href={`/stage/${stage.id}`}>{stage.titre}</Link>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <div className="flex items-center gap-1">
                              <Icon src="page" />
                              <p>Voir les détails</p>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-fit">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                              Informations du stage
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-2">
                              {stage.competences
                                .split(",")
                                .map((competence, index) => {
                                  return (
                                    <Badge
                                      className="border-gray-500 bg-transparent text-gray-700"
                                      key={index}
                                    >
                                      {competence}
                                    </Badge>
                                  );
                                })}
                            </div>
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-2">
                                  <Icon src="page" className="w-6" />
                                  <p className="text-lg font-semibold">
                                    Description
                                  </p>
                                </div>
                              }
                              value={<p>{stage.description}</p>}
                            />
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-2">
                                  <Icon src="calendar" className="w-6" />
                                  <p className="text-lg font-semibold">
                                    Date d&apos;inscription
                                  </p>
                                </div>
                              }
                              value={
                                <p>
                                  {format(stage.dateDebut, "PPP", {
                                    locale: fr,
                                  }) +
                                    " - " +
                                    format(stage.dateFin, "PPP", {
                                      locale: fr,
                                    })}
                                </p>
                              }
                            />
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-1">
                                  <Icon src="map-pin" className="w-6" />
                                  <p className="text-lg font-semibold">Lieu</p>
                                </div>
                              }
                              value={<p>{stage.lieu}</p>}
                            />
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
                      <Link href={`/entreprise/${stage.id}`}>
                        <Button className="best-transition border-2 border-black/30 bg-transparent text-black hover:bg-white">
                          Voir les candidatures du stage
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${color.border} ${color.bg} ${color.text}`}
                      >
                        {stage.secteur.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(stage.statut)}>
                        {stage.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StageModify
                        titre={stage.titre}
                        description={stage.description}
                        dateDebut={stage.dateDebut}
                        dateFin={stage.dateFin}
                        lieu={stage.lieu}
                        id={stage.id}
                        secteurId={stage.secteur.id}
                        competences={stage.competences}
                        duree={stage.duree}
                        disabled={stage.statut !== "Disponible"}
                        refetch={refetch}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {stage.statut === "Disponible" ? (
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
                              <Button
                                className="best-transition bg-red-500 text-white hover:bg-red-600"
                                onClick={() =>
                                  handleSupprimerOffreStage({
                                    id: stage.id,
                                  })
                                }
                                disabled={isLoading}
                                variant={isLoading ? "disable" : "destructive"}
                              >
                                {isLoading ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  "Confirmer"
                                )}
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button variant={"disable"} disabled>
                          <div className="flex items-center gap-2">
                            <Icon src="trash-black" className="w-4" />
                            <p>Supprimer</p>
                          </div>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex">
            {offres && offres.length > 0 ? (
              <p className="font-semibold">
                Votre filtre ne correspond à aucune de vos offres.
              </p>
            ) : (
              <p>Vous n&apos;avez pas encore crée d&apos;offre.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const InformationsOffreItem = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label}
      {value}
    </div>
  );
};
