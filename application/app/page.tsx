"use client";
import Icon from "@/components/Icon";
import PaginationComposant from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { colorMap, FetchAllOffers } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async (): Promise<FetchAllOffers> => {
      const response = await fetch(`/api/offers`);
      return await response.json();
    },
  });
}

export default function Home() {
  const { isError, data: offers, isLoading } = useOffers();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [page, setPage] = useState(1);

  const filteredOffers = offers
    ?.filter((offer) => {
      return (
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.company.name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((_, index) => {
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      return index >= startIndex && index < endIndex;
    });

  return (
    <main className="flex w-[80%] flex-col gap-10 px-6 py-12">
      <div className="mb-6 flex w-full items-center justify-between">
        <h2 className="text-2xl font-bold">Stages disponibles</h2>
        <div className="flex w-[20%] flex-col items-end gap-2">
          <Input
            type="text"
            placeholder="Rechercher une offre..."
            className="w-full border-black/50"
            onChange={(e) => setSearch(e.target.value)}
            value={search || ""}
          />
          <p className="text-sm">
            {offers ? `${offers.length} stages trouvés` : "Chargement..."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-y-10">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
            return (
              <Skeleton
                className="h-[260px] w-[440px] rounded-lg bg-gray-200"
                key={i}
              />
            );
          })
        ) : isError ? (
          <p className="text-red-500">
            Une erreur est survenue lors du chargement
          </p>
        ) : filteredOffers && filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => {
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
                      <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                        <Image
                          src={"/icon/building.svg"}
                          alt="Icon"
                          width={500}
                          height={500}
                          className="mr-1.5 h-3.5 w-3.5"
                        />
                        {offer.company.name}
                      </div>
                      <h3 className="group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors">
                        {offer.title}
                      </h3>
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
        totalPages={offers ? Math.ceil(offers?.length / 10) : 0}
      />
    </main>
  );
}
