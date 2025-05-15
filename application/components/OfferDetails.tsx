"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { colorMap, FetchOfferDetails } from "@/types/types";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { submitSubmission } from "@/lib/actions/submission";
import toast from "react-hot-toast";
import FileUpload from "./form/FileUpload";

function useOfferDetails({ id }: { id: string }) {
  return useQuery({
    queryKey: ["offer", id],
    queryFn: async (): Promise<FetchOfferDetails> => {
      const response = await fetch(`/api/offers/${id}`);
      return await response.json();
    },
  });
}

export default function OfferDetails({ id }: { id: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isError, data, isLoading } = useOfferDetails({ id });

  const enable =
    data &&
    session &&
    !data.expired &&
    data.offer.status === "Available" &&
    session.user.role === "student" &&
    !data.alreadySubmit;

  const color = data?.offer.sector.color
    ? colorMap[data?.offer.sector.color] || colorMap.blue
    : colorMap.blue;

  const zodFormSchema = z.object({
    resume: z
      .custom<File>()
      .refine((val) => val?.type === "application/pdf", {
        message: "Le fichier doit être au format PDF.",
      })
      .optional(),
    motivationLetter: z
      .custom<File>((val) => val instanceof File, {
        message: "Un fichier est requis.",
      })
      .refine((val) => val.type === "application/pdf", {
        message: "Le fichier doit être au format PDF.",
      }),
  });
  type FormSchema = z.infer<typeof zodFormSchema>;

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(zodFormSchema),
  });

  const handleSubmitForm = async (formData: FormSchema) => {
    const result = await submitSubmission({
      offerId: id,
      motivationLetter: formData.motivationLetter,
      resume: formData.resume ? formData.resume : undefined,
    });

    if (result.success) {
      toast.success(result.message);
      router.push("/student");
    } else {
      toast.error(result.message);
    }
  };

  if (isError) {
    router.push("/");
    return null;
  }
  return (
    <main className="container flex flex-col gap-3 px-6 py-12">
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        data && (
          <>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-muted-foreground best-transition flex w-fit items-center gap-2 rounded-md px-2 py-1 font-medium hover:bg-white"
              >
                <Image
                  src={"/icon/nav-arrow-left.svg"}
                  alt="icon"
                  width={500}
                  height={500}
                  className="mr-1 h-4 w-4"
                />
                <p>Retour</p>
              </Link>

              <div className="flex flex-col gap-2">
                <Badge className={`${color.border} ${color.bg} ${color.text}`}>
                  {data.offer.sector.label}
                </Badge>
                <h1 className="mb-2 text-3xl font-bold">{data.offer.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-8">
              <Card className="h-fit w-fit min-w-[900px]">
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="mb-4 text-xl font-semibold">
                        Informations du stage
                      </h2>
                      {data.offer.status === "Completed" ? (
                        <Badge className="border-gray-500 bg-gray-50 text-gray-600">
                          Complet
                        </Badge>
                      ) : data.expired || data.offer.status === "Expired" ? (
                        <Badge className="border-red-500 bg-red-50 text-red-600">
                          Expirée
                        </Badge>
                      ) : (
                        data.offer.status === "Available" && (
                          <Badge className="border-green-500 bg-green-50 text-green-600">
                            Disponible
                          </Badge>
                        )
                      )}
                    </div>
                    <div className="flex justify-between gap-4">
                      <InfoItem
                        icon="map-pin"
                        label={"Lieu"}
                        value={data.offer.location}
                      />
                      <InfoItem
                        icon="calendar"
                        label={"Période d'inscription"}
                        value={`Du ${format(data.offer.startDate, "dd/MM/yyyy")} au ${format(data.offer.endDate, "dd/MM/yyyy")}`}
                      />
                      <InfoItem
                        icon="clock"
                        label={"Durée"}
                        value={data.offer.duration}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <h2 className="mb-4 text-xl font-semibold">
                      Description du stage
                    </h2>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">
                        {data.offer.description}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <h2 className="mb-4 text-xl font-semibold">
                      Compétences requises
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {data.offer.skills.split(",").map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-fit min-w-[500px]">
                <CardContent className="flex flex-col gap-7">
                  <div className="flex flex-col gap-3">
                    <h2 className="mb-4 text-lg font-semibold">
                      Informations de l&apos;entreprise
                    </h2>
                    <div className="grid grid-cols-2 gap-y-3">
                      <InfoItem
                        icon="building"
                        label="Nom"
                        value={data.offer.company.name}
                      />
                      <InfoItem
                        icon="mail"
                        label="E-mail"
                        value={data.offer.company.email}
                      />
                      <InfoItem
                        icon="map-pin"
                        label="Adresse"
                        value={data.offer.company.address}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-y-3">
                    <h2 className="mb-4 text-lg font-semibold">
                      Informations du contact
                    </h2>
                    <div className="grid grid-cols-2 gap-y-3">
                      <InfoItem
                        icon="user"
                        label="Nom"
                        value={data.offer.company.contact.name}
                      />
                      <InfoItem
                        icon="user"
                        label="Prénom"
                        value={data.offer.company.contact.firstName}
                      />
                      <InfoItem
                        icon="mail"
                        label="E-mail"
                        value={data.offer.company.contact.email}
                      />
                    </div>
                  </div>
                  <Separator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant={`${!enable ? "disable" : "default"}`}
                        disabled={!enable}
                      >
                        {!session
                          ? "Veuillez vous connecter pour postuler"
                          : session.user.role !== "student"
                            ? "Votre compte ne peut pas postuler"
                            : data.expired || data.offer.status === "Expired"
                              ? "Expirée"
                              : data.offer.status === "Completed"
                                ? "Complet"
                                : data.alreadySubmit
                                  ? "Vous avez déjà postulé"
                                  : "Postuler à ce stage"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Postuler</DialogTitle>
                        <DialogDescription>
                          Ajoutez votre CV (optionnel) et votre lettre de
                          motivation pour postuler.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <div className="grid gap-4 py-4">
                          <FileUpload
                            errorsForm={errors.resume?.message}
                            setValue={setValue}
                            id="resume"
                            label={<>CV (PDF)</>}
                            text="Ajoutez votre CV"
                          />
                          <FileUpload
                            errorsForm={errors.motivationLetter?.message}
                            setValue={setValue}
                            id="motivationLetter"
                            label={
                              <>
                                Lettre de motivation (PDF){" "}
                                <span className="text-red-500">*</span>
                              </>
                            }
                            text="Ajoutez votre lettre de motivation"
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Annuler
                            </Button>
                          </DialogClose>
                          <Button
                            disabled={isSubmitting}
                            variant={`${isSubmitting ? "disable" : "default"}`}
                            className="w-fit"
                            type="submit"
                          >
                            {isSubmitting ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Postuler"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}
    </main>
  );
}

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={`/icon/${icon}.svg`}
        alt="icon"
        width={700}
        height={700}
        className="text-muted-foreground mt-0.5 w-6"
      />
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground">{value}</div>
      </div>
    </div>
  );
};
