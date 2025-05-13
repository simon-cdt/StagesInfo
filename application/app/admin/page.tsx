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
import UpdateEtudiantAdminInformationsForm from "@/components/form/admin/etudiant/updateInformations";
import UpdateEtudiantAdminPasswordForm from "@/components/form/admin/etudiant/updatePassword";
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
import { deleteEtudiant } from "@/lib/actions/admin";
import { Loader2 } from "lucide-react";

type FetchEtudiant = [
  {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string;
    deleteable: boolean;
  },
];

function useUsers() {
  return useQuery({
    queryKey: ["utilisateurs_admin"],
    queryFn: async (): Promise<FetchEtudiant> => {
      const response = await fetch(`/api/admin/etudiants`);
      return await response.json();
    },
  });
}

export default function AdminEtudiantPage() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isError, data: utilisateurs, isFetching, refetch } = useUsers();

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const filteredUtilisateurs = utilisateurs?.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.nom.toLowerCase().includes(searchTerm) ||
      item.prenom.toLowerCase().includes(searchTerm)
    );
  });
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full flex-col gap-4">
          <h1 className={"text-3xl font-bold"}>Les étudiants</h1>
          <div className="flex w-full justify-between">
            {/* <CreateUserForm refetch={refetch} /> */}
            <Input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-[20%] border-black/50"
              onChange={(e) => setSearch(e.target.value)}
              value={search || ""}
            />
          </div>
        </div>
        {isFetching ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : filteredUtilisateurs !== undefined &&
          filteredUtilisateurs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom et prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Modifier l&apos;utilisateur</TableHead>
                <TableHead>Modifier son mot de passe</TableHead>
                <TableHead>Supprimer l&apos;utilisateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUtilisateurs.map((item) => (
                <TableRow key={item.id}>
                  {/* NOM ET PRENOM */}
                  <TableCell>{`${item.nom} ${item.prenom}`}</TableCell>

                  {/* LES INFORMATIONS DE L'UTILISATEUR */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Icon src="mail" />
                      <p>{item.email}</p>
                    </div>
                  </TableCell>

                  {/* MODIFIER L'UTILISATEUR */}
                  <TableCell>
                    <UpdateEtudiantAdminInformationsForm
                      etudiant={{
                        id: item.id,
                        nom: item.nom,
                        prenom: item.prenom,
                        email: item.email,
                        competences: item.competences,
                      }}
                      refetch={refetch}
                    />
                  </TableCell>

                  {/* MODIFIER MOT DE PASSE */}
                  <TableCell>
                    <UpdateEtudiantAdminPasswordForm id={item.id} />
                  </TableCell>

                  {/* SUPPRIMER L'UTILISATEUR */}
                  <TableCell>
                    {item.deleteable ? (
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
                              l&apos;étudiant ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible, l&apos;étudiant
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
                                const response = await deleteEtudiant({
                                  id: item.id,
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
                              disabled={isLoading}
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
                Votre filtre ne correspond à aucun des utilisateurs.
              </p>
            ) : (
              <>
                <p>
                  Il n&apos;y a pas d&apos;utilisateurs dans la base de données
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
