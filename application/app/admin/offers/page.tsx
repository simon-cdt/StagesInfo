"use client";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Icon from "@/components/Icon";
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
import { Badge } from "@/components/ui/badge";
import { OfferStatus } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { colorMap } from "@/types/types";
import UpdateOfferAdminForm from "@/components/form/admin/Offers/Update";
import CreateOfferAdminForm from "@/components/form/admin/Offers/Create";
import DeleteOfferAdmin from "@/components/delete/DeleteOfferAdmin";

export type FetchOffers = [
  {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: OfferStatus;
    skills: string;
    duration: string;
    location: string;
    sector: {
      id: string;
      label: string;
      color: string;
    };
    company: {
      id: string;
      name: string;
    };
    deleteable: boolean;
    expired: boolean;
  },
];

function useOffers() {
  return useQuery({
    queryKey: ["offers_admin"],
    queryFn: async (): Promise<FetchOffers> => {
      const response = await fetch(`/api/admin/offers`);
      return await response.json();
    },
  });
}

export default function OffresAdminPage() {
  const { isError, data: offers, isLoading, refetch } = useOffers();

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const filteredOffers = offers?.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      item.company.name.toLowerCase().includes(searchTerm)
    );
  });

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case "Available":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "Expired":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full flex-col gap-4">
          <h1 className={"text-3xl font-bold"}>Les offres</h1>
          <div className="flex w-full justify-between">
            <CreateOfferAdminForm refetch={refetch} />
            <Input
              type="text"
              placeholder="Rechercher une offre..."
              className="w-[20%] border-black/50"
              onChange={(e) => setSearch(e.target.value)}
              value={search || ""}
            />
          </div>
        </div>
        {isLoading ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : filteredOffers !== undefined && filteredOffers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Voir les détails du stage</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Modifier l&apos;offre de stage</TableHead>
                <TableHead>Supprimer l&apos;entreprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => {
                const color = colorMap[offer.sector.color] || colorMap.blue;
                return (
                  <TableRow key={offer.id}>
                    <TableCell>{`${offer.title}`}</TableCell>

                    <TableCell>
                      <p>{offer.company.name}</p>
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
                            <Badge
                              className={`${color.border} ${color.bg} ${color.text}`}
                            >
                              {offer.sector.label}
                            </Badge>
                            <div className="flex flex-wrap gap-2">
                              {offer.skills.split(",").map((skill, index) => {
                                return (
                                  <Badge
                                    className="border-gray-500 bg-transparent text-gray-700"
                                    key={index}
                                  >
                                    {skill}
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
                              value={
                                <p className="whitespace-pre-line">
                                  {offer.description}
                                </p>
                              }
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
                                  {format(offer.startDate, "PPP", {
                                    locale: fr,
                                  }) +
                                    " - " +
                                    format(offer.endDate, "PPP", {
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
                              value={<p>{offer.location}</p>}
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
                      <Badge
                        className={getStatusBadgeClass(
                          offer.expired ? "Expired" : offer.status,
                        )}
                      >
                        {offer.expired
                          ? "Expirée"
                          : offer.status === "Available"
                            ? "Disponible"
                            : offer.status === "Completed" && "Pourvue"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <UpdateOfferAdminForm
                        id={offer.id}
                        title={offer.title}
                        description={offer.description}
                        duration={offer.duration}
                        startDate={offer.startDate}
                        endDate={offer.endDate}
                        location={offer.location}
                        skills={offer.skills}
                        disabled={!offer.deleteable}
                        sectorId={offer.sector.id}
                        refetch={refetch}
                      />
                    </TableCell>

                    <TableCell>
                      {offer.deleteable ? (
                        <DeleteOfferAdmin
                          offerId={offer.id}
                          refetch={refetch}
                        />
                      ) : (
                        <Button variant={"disable"} disabled>
                          <div className="flex items-center gap-1">
                            <Icon src="trash-black" />
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
            {search !== "" ? (
              <p className="font-semibold">
                Votre filtre ne correspond à aucune offre d&apos;entreprise.
              </p>
            ) : (
              <>
                <p>
                  Il n&apos;y a pas d&apos;offres de stage d&apos;entreprise
                  dans la base de données
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const InformationsOffreItem = ({
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
