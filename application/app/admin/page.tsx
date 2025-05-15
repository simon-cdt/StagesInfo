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
import UpdateStudentInformationsAdminForm from "@/components/form/admin/Students/UpdateInformations";
import UpdateEtudiantAdminPasswordForm from "@/components/form/admin/Students/UpdatePassword";
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
import CreateStudentAdminForm from "@/components/form/admin/Students/Create";
import { deleteStudentAdmin } from "@/lib/actions/admin/student";

export type FetchStudent = [
  {
    id: string;
    name: string;
    firstName: string;
    email: string;
    skills: string;
    deleteable: boolean;
  },
];

function useStudents() {
  return useQuery({
    queryKey: ["students_admin"],
    queryFn: async (): Promise<FetchStudent> => {
      const response = await fetch(`/api/admin/students`);
      return await response.json();
    },
  });
}

export default function AdminStudentsPage() {
  const [open, setOpen] = useState(false);
  const [isLoadingFetch, setIsLoading] = useState(false);

  const { isError, data: students, isLoading, refetch } = useStudents();

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const filteredStudents = students?.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.firstName.toLowerCase().includes(searchTerm)
    );
  });
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full flex-col gap-4">
          <h1 className={"text-3xl font-bold"}>Les étudiants</h1>
          <div className="flex w-full justify-between">
            <CreateStudentAdminForm refetch={refetch} />
            <Input
              type="text"
              placeholder="Rechercher un étudiant..."
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
        ) : filteredStudents !== undefined && filteredStudents.length > 0 ? (
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
              {filteredStudents.map((item) => (
                <TableRow key={item.id}>
                  {/* NOM ET PRENOM */}
                  <TableCell>{`${item.name} ${item.firstName}`}</TableCell>

                  {/* LES INFORMATIONS DE L'UTILISATEUR */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Icon src="mail" />
                      <p>{item.email}</p>
                    </div>
                  </TableCell>

                  {/* MODIFIER L'UTILISATEUR */}
                  <TableCell>
                    <UpdateStudentInformationsAdminForm
                      student={{
                        id: item.id,
                        name: item.name,
                        firstName: item.firstName,
                        email: item.email,
                        skills: item.skills,
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
                                const response = await deleteStudentAdmin({
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
