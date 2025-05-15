"use client";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Icon from "@/components/Icon";
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
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import UpdateCompanyInformationsAdminForm from "@/components/form/admin/Companies/UpdateInformations";
import UpdateCompanyContactInformationsAdminForm from "@/components/form/admin/Companies/UpdateContactInformations";
import UpdateCompanyPasswordAdminForm from "@/components/form/admin/Companies/UpdatePassword";
import { deleteCompanyAdmin } from "@/lib/actions/admin/company";
import CreateCompanyAdminForm from "@/components/form/admin/Companies/Create";

type FetchCompany = [
  {
    id: string;
    name: string;
    address: string;
    email: string;
    sectors: [
      {
        sector: {
          id: string;
          label: string;
          color: string;
        };
      },
    ];
    contact: {
      id: string;
      name: string;
      firstName: string;
      email: string;
    };
    deleteable: boolean;
  },
];

function useCompany() {
  return useQuery({
    queryKey: ["companies_admin"],
    queryFn: async (): Promise<FetchCompany> => {
      const response = await fetch(`/api/admin/companies`);
      return await response.json();
    },
  });
}

export default function EntreprisesAdminPage() {
  const [open, setOpen] = useState(false);
  const [isLoadingFetch, setIsLoading] = useState(false);

  const { isError, data: companies, isLoading, refetch } = useCompany();

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const filteredCompanies = companies?.filter((item) => {
    const searchTerm = search.toLowerCase();
    return item.name.toLowerCase().includes(searchTerm);
  });
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full flex-col gap-4">
          <h1 className={"text-3xl font-bold"}>Les entreprises</h1>
          <div className="flex w-full justify-between">
            <CreateCompanyAdminForm refetch={refetch} />
            <Input
              type="text"
              placeholder="Rechercher une entreprise..."
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
        ) : filteredCompanies !== undefined && filteredCompanies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Voir les informations</TableHead>
                <TableHead>Modifier l&apos;entreprise</TableHead>
                <TableHead>Modifier le contact de l&apos;entreprise</TableHead>
                <TableHead>Modifier son mot de passe</TableHead>
                <TableHead>Supprimer l&apos;entreprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((entreprise) => (
                <TableRow key={entreprise.id}>
                  {/* NOM ET PRENOM */}
                  <TableCell>{`${entreprise.name}`}</TableCell>

                  {/* LES INFORMATIONS DE L'UTILISATEUR */}
                  <TableCell className="flex flex-col gap-1">
                    <p>
                      {entreprise.contact.name +
                        " " +
                        entreprise.contact.firstName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Icon src="mail" />
                      <p>{entreprise.email}</p>
                    </div>
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
                            Informations de l&apos;entreprise
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap gap-2">
                            {entreprise.sectors.map((item, index) => {
                              return (
                                <Badge
                                  className="border-gray-500 bg-transparent text-gray-700"
                                  key={index}
                                >
                                  {item.sector.label}
                                </Badge>
                              );
                            })}
                          </div>
                          <InformationsOffreItem
                            label={
                              <div className="flex items-center gap-2">
                                <Icon src="building" className="w-4" />
                                <p>Nom de l&apos;entreprise</p>
                              </div>
                            }
                            value={<p>{entreprise.name}</p>}
                          />
                          <div className="flex justify-between gap-7">
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-2">
                                  <Icon src="mail" className="w-4" />
                                  <p>Mail</p>
                                </div>
                              }
                              value={<p>{entreprise.email}</p>}
                            />
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-1">
                                  <Icon src="map-pin" className="w-4" />
                                  <p>Adresse</p>
                                </div>
                              }
                              value={<p>{entreprise.address}</p>}
                            />
                          </div>
                          <Separator />
                          <p className="font-semibold">
                            Contact de l&apos;entreprise
                          </p>
                          <div className="flex justify-between gap-7">
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-1">
                                  <Icon src="user" className="w-4" />
                                  <p>Nom et prénom</p>
                                </div>
                              }
                              value={
                                <p>{`${entreprise.contact.name} ${entreprise.contact.firstName}`}</p>
                              }
                            />
                            <InformationsOffreItem
                              label={
                                <div className="flex items-center gap-2">
                                  <Icon src="mail" className="w-4" />
                                  <p>Mail</p>
                                </div>
                              }
                              value={<p>{entreprise.contact.email}</p>}
                            />
                          </div>
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

                  {/* MODIFIER L'ENTREPRISE */}
                  <TableCell>
                    <UpdateCompanyInformationsAdminForm
                      company={{
                        id: entreprise.id,
                        name: entreprise.name,
                        email: entreprise.email,
                        address: entreprise.address,
                        sectors: entreprise.sectors.map((secteur) => {
                          return secteur.sector.id;
                        }),
                      }}
                      refetch={refetch}
                    />
                  </TableCell>

                  <TableCell>
                    <UpdateCompanyContactInformationsAdminForm
                      contact={{
                        id: entreprise.contact.id,
                        name: entreprise.contact.name,
                        firstName: entreprise.contact.firstName,
                        email: entreprise.contact.email,
                      }}
                      refetch={refetch}
                    />
                  </TableCell>

                  {/* MODIFIER MOT DE PASSE */}
                  <TableCell>
                    <UpdateCompanyPasswordAdminForm id={entreprise.id} />
                  </TableCell>

                  {/* SUPPRIMER L'UTILISATEUR */}
                  <TableCell>
                    {entreprise.deleteable ? (
                      <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant={"destructive"}>
                            <div className="flex items-center gap-1">
                              <Icon src="trash" />
                              <p>Supprimer</p>
                            </div>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous vraiment sûr de supprimer
                              l&apos;entreprise ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible, l&apos;entreprise
                              devra se refaire un compte.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="pointer">
                              Annuler
                            </AlertDialogCancel>
                            <Button
                              className="pointer pointer bg-red-500 text-white hover:bg-red-600 hover:text-white"
                              onClick={async () => {
                                setIsLoading(true);
                                const response = await deleteCompanyAdmin({
                                  id: entreprise.id,
                                });
                                if (!response.success) {
                                  setOpen(false);
                                  setIsLoading(false);
                                  toast.error(response.message);
                                } else {
                                  setOpen(false);
                                  setIsLoading(false);
                                  toast.success(response.message);
                                  refetch();
                                }
                              }}
                              disabled={isLoadingFetch}
                            >
                              {isLoadingFetch ? (
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
                        <div className="flex items-center gap-1">
                          <Icon src="trash-black" />
                          <p>Supprimer</p>
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
                Votre filtre ne correspond à aucune des entreprises.
              </p>
            ) : (
              <>
                <p>
                  Il n&apos;y a pas d&apos;entreprises dans la base de données
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
