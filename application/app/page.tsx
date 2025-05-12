"use client";
import { Button } from "@/components/ui/button";
import { colorMap, FetchStages } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

function useStages() {
  return useQuery({
    queryKey: ["stages"],
    queryFn: async (): Promise<FetchStages> => {
      const response = await fetch(`/api/stages`);
      return await response.json();
    },
  });
}

export default function Home() {
  const { isError, data: stages, isLoading } = useStages();

  return (
    <main className="container flex flex-col gap-10 px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stages disponibles</h2>
        <div className="text-muted-foreground text-sm">
          {stages && stages.length} stages trouvés
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-y-10">
        {isLoading ? null : isError ? (
          <p className="text-red-500">
            Une erreur est survenue lors du chargement
          </p>
        ) : (
          stages &&
          stages.map((stage) => {
            const color = colorMap[stage.secteur.couleur] || colorMap.blue;
            return (
              <Link
                href={`/stage/${stage.id}`}
                key={stage.id}
                className="w-[440px]"
              >
                <div className="best-transition flex h-full flex-col overflow-hidden rounded-lg border bg-white hover:shadow-md">
                  <div
                    className={`${color.border} ${color.bg} p-4 ${color.text}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {stage.secteur.label}
                      </span>
                      <span className="text-sm">{stage.duree}</span>
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
                        {stage.entreprise.nom}
                      </div>
                      <h3 className="group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors">
                        {stage.titre}
                      </h3>
                    </div>

                    <div className="text-muted-foreground mb-4 flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Image
                          src={"/icon/map-pin.svg"}
                          alt="Icon"
                          width={500}
                          height={500}
                          className="mr-2 h-4 w-4 flex-shrink-0"
                        />
                        <span>{stage.lieu}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image
                          src={"/icon/calendar.svg"}
                          alt="Icon"
                          width={500}
                          height={500}
                          className="mr-2 h-4 w-4 flex-shrink-0"
                        />
                        <span>
                          Du {format(stage.dateDebut, "dd/MM/yyyy")} au{" "}
                          {format(stage.dateFin, "dd/MM/yyyy")}
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
        )}
      </div>
    </main>
  );
}
