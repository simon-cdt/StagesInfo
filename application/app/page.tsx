"use client";

import Icon from "@/components/Icon";
import PaginationComposant from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { colorMap, FetchAllOffers, FetchSectorsList } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async (): Promise<FetchAllOffers> => {
      const response = await fetch(`/api/offers`);
      return await response.json();
    },
  });
}

function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: async (): Promise<FetchSectorsList> => {
      const response = await fetch(`/api/sectors`);
      return await response.json();
    },
  });
}

export default function Home() {
  const {
    isError: isErrorOffers,
    data: offers,
    isLoading: isLoadingOffers,
  } = useOffers();
  const {
    isError: isErrorSectors,
    data: sectors,
    isLoading: isLoadingSectors,
  } = useSectors();

  const [isOpen, setIsOpen] = useState(false);

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [selectedSectors, setSelectedSectors] = useQueryState(
    "sectors",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [selectedSkills, setSelectedSkills] = useQueryState(
    "skills",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [selectedLocations, setSelectedLocations] = useQueryState(
    "locations",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const [page, setPage] = useState(1);

  const filteredOffers = offers
    ?.filter((offer) => {
      return (
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.company.name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((offer) => {
      return (
        selectedSectors.length === 0 ||
        selectedSectors.includes(offer.sector.id)
      );
    })
    .filter((offer) => {
      return (
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) =>
          offer.skills.toLowerCase().includes(skill.toLowerCase()),
        )
      );
    })
    .filter((offer) => {
      return (
        selectedLocations.length === 0 ||
        selectedLocations.includes(offer.location)
      );
    });

  const pagedOffers = filteredOffers?.slice((page - 1) * 10, page * 10);
  const totalPages = filteredOffers ? Math.ceil(filteredOffers.length / 10) : 0;

  return (
    <main className="flex w-[80%] flex-col gap-10 px-6 py-12">
      <div className="mb-6 flex w-full items-center justify-between">
        <h2 className="text-2xl font-bold">Stages disponibles</h2>
        <div className="flex w-[20%] flex-col items-end gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <Input
              type="text"
              placeholder="Rechercher une offre..."
              className="w-full border-black/50"
              onChange={(e) => setSearch(e.target.value)}
              value={search || ""}
            />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger className="pointer best-transition w-fit rounded-md bg-black py-2 text-sm text-white hover:bg-black/80">
                <div className="flex w-24 items-center justify-between gap-2 px-4">
                  <Icon src="filter" className="w-5" />
                  <p>Filtrer</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filtrer les offres de stage</DialogTitle>
                  <DialogDescription>
                    Veuillez entrer les critères de filtrage souhaités.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <p>Secteurs :</p>
                    <div className="grid max-h-32 grid-cols-2 gap-4 overflow-y-auto">
                      {isLoadingSectors ? (
                        [1, 2, 3, 4].map((i) => {
                          return (
                            <Skeleton
                              className="h-4 w-full rounded-lg bg-gray-200"
                              key={i}
                            />
                          );
                        })
                      ) : isErrorSectors ? (
                        <p className="text-sm text-red-500">
                          Une erreur est survenue
                        </p>
                      ) : (
                        sectors &&
                        sectors.map((sector) => {
                          return (
                            <div
                              className="flex items-center gap-2"
                              key={sector.id}
                            >
                              <Checkbox
                                id={sector.id}
                                checked={selectedSectors.includes(sector.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedSectors([
                                      ...selectedSectors,
                                      sector.id,
                                    ]);
                                  } else {
                                    setSelectedSectors(
                                      selectedSectors.filter(
                                        (id) => id !== sector.id,
                                      ),
                                    );
                                  }
                                }}
                              />

                              <Label
                                htmlFor={sector.id}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {sector.label}
                              </Label>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p>Compétences :</p>
                    <div className="grid max-h-32 grid-cols-2 gap-4 overflow-y-auto">
                      {isLoadingOffers ? (
                        [1, 2, 3, 4].map((i) => {
                          return (
                            <Skeleton
                              className="h-4 w-full rounded-lg bg-gray-200"
                              key={i}
                            />
                          );
                        })
                      ) : isErrorOffers ? (
                        <p className="text-sm text-red-500">
                          Une erreur est survenue
                        </p>
                      ) : (
                        [
                          ...new Set(
                            offers?.flatMap((offer) => {
                              return offer.skills
                                .split(",")
                                .map((skill) => skill.trim());
                            }) || [],
                          ),
                        ].map((skill, index) => (
                          <div className="flex items-center gap-2" key={index}>
                            <Checkbox
                              id={`skill-${index}`}
                              checked={selectedSkills.includes(skill)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSkills([...selectedSkills, skill]);
                                } else {
                                  setSelectedSkills(
                                    selectedSkills.filter((s) => s !== skill),
                                  );
                                }
                              }}
                            />

                            <Label
                              htmlFor={`${index}`}
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {skill}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p>Lieu :</p>
                    <div className="grid max-h-32 grid-cols-2 gap-4 overflow-y-auto">
                      {isLoadingOffers ? (
                        [1, 2, 3, 4].map((i) => {
                          return (
                            <Skeleton
                              className="h-4 w-full rounded-lg bg-gray-200"
                              key={i}
                            />
                          );
                        })
                      ) : isErrorOffers ? (
                        <p className="text-sm text-red-500">
                          Une erreur est survenue
                        </p>
                      ) : (
                        filteredOffers &&
                        [
                          ...new Set(
                            offers?.map((offer) => offer.location) || [],
                          ),
                        ].map((location) => (
                          <div
                            className="flex items-center gap-2"
                            key={location}
                          >
                            <Checkbox
                              id={`location-${location}`}
                              checked={selectedLocations.includes(location)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedLocations([
                                    ...selectedLocations,
                                    location,
                                  ]);
                                } else {
                                  setSelectedLocations(
                                    selectedLocations.filter(
                                      (l) => l !== location,
                                    ),
                                  );
                                }
                              }}
                            />

                            <Label
                              htmlFor={`${location}`}
                              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {location}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <Button
                    className="w-fit"
                    onClick={() => {
                      setSelectedSectors([]);
                      setSelectedSkills([]);
                      setSelectedLocations([]);
                      setSearch("");
                      setIsOpen(false);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                  <Button
                    type="button"
                    variant={"outline"}
                    className="w-fit"
                    onClick={() => setIsOpen(false)}
                  >
                    Consulter les offres
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm">
            {offers ? `${offers.length} stages trouvés` : "Chargement..."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-y-10">
        {isLoadingOffers ? (
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
            return (
              <Skeleton
                className="h-[260px] w-[440px] rounded-lg bg-gray-200"
                key={i}
              />
            );
          })
        ) : isErrorOffers ? (
          <p className="text-red-500">
            Une erreur est survenue lors du chargement
          </p>
        ) : pagedOffers && pagedOffers.length > 0 ? (
          pagedOffers.map((offer) => {
            const color = colorMap[offer.sector.color] || colorMap.blue;
            return (
              <Link
                href={`/offer/${offer.id}`}
                key={offer.id}
                className="w-[440px]"
              >
                <div className="best-transition flex h-full flex-col overflow-hidden rounded-lg border bg-white hover:shadow-md">
                  <div
                    className={`${color.border} ${color.bg} p-4 ${color.text}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {offer.sector.label}
                      </span>
                      <span className="text-sm">{offer.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-5">
                    <div className="mb-4 flex flex-col gap-1">
                      <div className="text-muted-foreground flex items-center gap-1 text-base font-medium">
                        <Image
                          src={"/icon/building.svg"}
                          alt="Icon"
                          width={500}
                          height={500}
                          className="w-5"
                        />
                        {offer.company.name}
                      </div>
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                    </div>

                    <div className="text-muted-foreground mb-4 flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Icon
                          src="map-pin"
                          className="mr-2 h-4 w-4 flex-shrink-0"
                        />
                        <span>{offer.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon
                          src="calendar"
                          className="mr-2 h-4 w-4 flex-shrink-0"
                        />
                        <span>
                          Du {format(offer.startDate, "dd/MM/yyyy")} au{" "}
                          {format(offer.endDate, "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-end border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Voir le stage
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : offers && offers.length > 0 ? (
          <p className="text-muted-foreground">
            Le filtre ne correspond à aucun stage.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Aucun stage trouvé pour le moment.
          </p>
        )}
      </div>

      <PaginationComposant
        currentPage={page}
        setPage={setPage}
        paginationItemsToDisplay={10}
        totalPages={totalPages}
      />
    </main>
  );
}
