"use client";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
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
import { Badge } from "@/components/ui/badge";
import { SubmissionStatus } from "@prisma/client";
import Link from "next/link";
import UpdateSubmissionAdminForm from "@/components/form/admin/Submissions/Update";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateSubmissionAdmin from "@/components/form/admin/Submissions/Create";
import DeleteSubmissionAdmin from "@/components/delete/DeleteSubmissionAdmin";
import RejectAdmin from "@/components/submission/RejectAdmin";
import AcceptAdmin from "@/components/submission/AcceptAdmin";

type FetchSubmissions = [
  {
    id: string;
    date: Date;
    offer: {
      id: string;
      title: string;
      company: {
        id: string;
        name: string;
      };
    };
    status: SubmissionStatus;
    student: {
      id: string;
      name: string;
      firstName: string;
      email: string;
    };
    deleteable: boolean;
  },
];

function useSubmissions() {
  return useQuery({
    queryKey: ["submissions_admin"],
    queryFn: async (): Promise<FetchSubmissions> => {
      const response = await fetch(`/api/admin/submissions`);
      return await response.json();
    },
  });
}

export default function SubmisssionsAdminPage() {
  const { isError, data: submissions, isLoading, refetch } = useSubmissions();

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const [tabs, setTabs] = useQueryState(
    "tabs",
    parseAsString.withDefault("all"),
  );

  const filteredSubmissions = submissions
    ?.filter((item) => {
      const searchTerm = search.toLowerCase();
      return (
        item.offer.title.toLowerCase().includes(searchTerm) ||
        item.offer.company.name.toLowerCase().includes(searchTerm) ||
        item.student.name.toLowerCase().includes(searchTerm) ||
        item.student.firstName.toLowerCase().includes(searchTerm)
      );
    })
    ?.filter((item) => {
      if (tabs === "all") return true;
      if (tabs === "accepted") return item.status === "Accepted";
      if (tabs === "waiting") return item.status === "Waiting";
      if (tabs === "Rejected") return item.status === "Rejected";
    });

  const getStatusBadgeClass = (statut: string) => {
    switch (statut) {
      case "Waiting":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      case "Accepted":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-[90%] flex-col gap-10">
        <div className="flex w-full flex-col gap-4">
          <h1 className={"text-3xl font-bold"}>Les candidatures</h1>
          <div className="flex w-full justify-between">
            <CreateSubmissionAdmin refetch={refetch} />
            <Input
              type="text"
              placeholder="Rechercher une candidature..."
              className="w-[20%] border-black/50"
              onChange={(e) => setSearch(e.target.value)}
              value={search || ""}
            />
          </div>
        </div>
        <Tabs value={tabs} onValueChange={setTabs} className="w-[600px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="accepted">Acceptée</TabsTrigger>
            <TabsTrigger value="waiting">En attente</TabsTrigger>
            <TabsTrigger value="rejected">Refusée</TabsTrigger>
          </TabsList>
        </Tabs>
        {isLoading ? (
          <p>Les données sont entrain d&apos;être chargées...</p>
        ) : isError ? (
          <p className="text-red-500">Une erreur est survenue</p>
        ) : filteredSubmissions !== undefined &&
          filteredSubmissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Elève</TableHead>
                <TableHead>Voir le CV</TableHead>
                <TableHead>Voir la lettre de motivation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Modifier la candidature</TableHead>
                <TableHead>Supprimer la candidature</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => {
                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Link
                        href={`/offer/${submission.offer.id}`}
                        className="flex flex-col gap-1"
                      >
                        <div className="items-cente flex gap-1">
                          <Icon src="building" />
                          <p className="text-sm text-black/70">
                            {submission.offer.company.name}
                          </p>
                        </div>
                        <p className="underline">{submission.offer.title}</p>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold">{`${submission.student.firstName} ${submission.student.name}`}</p>
                      <div className="flex items-center gap-2">
                        <Icon src={"mail"} />
                        <p>{submission.student.email}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/admin/submissions/resume/${submission.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant={"outline"}>Voir le CV</Button>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/admin/submissions/motivationLetter/${submission.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant={"outline"}>
                          Voir la lettre de motivation
                        </Button>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusBadgeClass(submission.status)}>
                        {submission.status === "Accepted"
                          ? "Acceptée"
                          : submission.status === "Waiting"
                            ? "En attente"
                            : "Refusée"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <UpdateSubmissionAdminForm
                        id={submission.id}
                        disabled={submission.status !== "Waiting"}
                        refetch={refetch}
                      />
                    </TableCell>

                    <TableCell>
                      {submission.deleteable ? (
                        <DeleteSubmissionAdmin
                          id={submission.id}
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

                    <TableCell className="text-right">
                      {submission.status !== "Waiting" ? (
                        <Button variant={"disable"} disabled>
                          Interdit
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-4">
                          <RejectAdmin id={submission.id} refetch={refetch} />
                          <AcceptAdmin id={submission.id} refetch={refetch} />
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
