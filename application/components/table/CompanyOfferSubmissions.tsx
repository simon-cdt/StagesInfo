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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { FetchCompanyOfferSubmissions } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { acceptSubmission, rejectSubmission } from "@/lib/actions/submission";
import Icon from "../Icon";

function useSubmissions({ id }: { id: string }) {
  return useQuery({
    queryKey: ["CompanyOfferSubmissions", id],
    queryFn: async (): Promise<FetchCompanyOfferSubmissions> => {
      const response = await fetch(`/api/company/offers/${id}`);
      return await response.json();
    },
  });
}

export default function CompanyOfferSubmissions({ id }: { id: string }) {
  const {
    isError,
    data: submissions,
    isLoading: isLoadingOffer,
    refetch,
  } = useSubmissions({ id });

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [tabs, setTabs] = useQueryState(
    "tabs",
    parseAsString.withDefault("all"),
  );

  const filteredSubmissions = submissions
    ?.filter((item) => {
      const searchTerm = search.toLowerCase();
      return (
        item.student.name.toLowerCase().includes(searchTerm) ||
        item.student.firstName.toLowerCase().includes(searchTerm)
      );
    })
    ?.filter((item) => {
      if (tabs === "all") return true;
      if (tabs === "waiting") return item.status === "Waiting";
      if (tabs === "accepted") return item.status === "Accepted";
      if (tabs === "refused") return item.status === "Rejected";
      return true;
    });

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case "Waiting":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Accepted":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const handleRejectSubmission = async ({ id }: { id: string }) => {
    const response = await rejectSubmission({ id });
    if (response.success) {
      toast.success(response.message);
      refetch();
    } else {
      toast.error(response.message);
    }
  };

  const handleAcceptSubmission = async ({ id }: { id: string }) => {
    const response = await acceptSubmission({ id });
    if (response.success) {
      toast.success(response.message);
      refetch();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex w-full flex-col items-center pt-10">
      <div className="flex w-[90%] flex-col gap-7">
        <Link href={"/entreprise"}>
          <Button variant={"outline"} className="flex items-center gap-2">
            <Icon src="nav-arrow-left" />
            <p>Retour</p>
          </Button>
        </Link>
        <div className="flex w-full justify-between">
          <h1 className={"text-3xl font-bold"}>Les candidatures reçues</h1>
          <Input
            type="text"
            placeholder="Rechercher un élève..."
            className="w-[20%] border-black/50"
            onChange={(e) => setSearch(e.target.value)}
            value={search || ""}
          />
        </div>
        <Tabs value={tabs} onValueChange={setTabs} className="w-[600px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="waiting">En attente</TabsTrigger>
            <TabsTrigger value="accepted">Acceptée</TabsTrigger>
            <TabsTrigger value="refused">Refusées</TabsTrigger>
          </TabsList>
        </Tabs>
        {isLoadingOffer ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Elève</TableHead>
                <TableHead>CV</TableHead>
                <TableHead>Lettre de motivation</TableHead>
                <TableHead>Compétences</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de postulation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <p className="font-semibold">{`${submission.student.firstName} ${submission.student.name}`}</p>
                      <div className="flex items-center gap-2">
                        <Icon src="mail" />
                        <p>{submission.student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/company/resume/${submission.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="best-transition border-2 border-gray-400 bg-transparent text-black hover:bg-gray-200">
                          CV
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/company/motivationLetter/${submission.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="best-transition border-2 border-gray-400 bg-transparent text-black hover:bg-gray-200">
                          Lettre de motivation
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {submission.student.skills === "" ? (
                          <p className="text-red-500">Aucune compétences</p>
                        ) : (
                          submission.student.skills.split(",").map((item) => {
                            return (
                              <Badge
                                key={item}
                                className={`border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100`}
                              >
                                {item}
                              </Badge>
                            );
                          })
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(submission.status)}>
                        {submission.status === "Waiting"
                          ? "En attente"
                          : submission.status === "Accepted"
                            ? "Acceptée"
                            : "Refusée"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(submission.date), "PPP", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.disable || submission.status !== "Waiting" ? (
                        <Button variant={"disable"} disabled>
                          Interdit
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size={"icon"}
                                className="bg-transparent shadow-none hover:bg-red-200"
                              >
                                <Icon src="xmark-red" className="w-6" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Êtes-vous sûr de vouloir refuser cette
                                  candidature ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Vous
                                  pouvez toujours accepter la candidature plus
                                  tard.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRejectSubmission({
                                      id: submission.id,
                                    })
                                  }
                                  className="bg-red-500 text-white hover:bg-red-600"
                                >
                                  Confirmer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size={"icon"}
                                className="bg-transparent shadow-none hover:bg-emerald-200"
                              >
                                <Icon src="check-green" className="w-6" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Êtes-vous sûr de vouloir accepter cette
                                  candidature ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Toutes
                                  les autres candidatures seront refusées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                                  onClick={() =>
                                    handleAcceptSubmission({
                                      id: submission.id,
                                    })
                                  }
                                >
                                  Confirmer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex">
            {submissions && submissions.length > 0 ? (
              <p className="font-semibold">
                Votre filtre ne correspond à aucune des candidatures reçues.
              </p>
            ) : (
              <p>Vous n&apos;avez pas encore reçu de candidature.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
