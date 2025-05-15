import CompanyOfferSubmissions from "@/components/table/CompanyOfferSubmissions";
import React from "react";

export default async function CandidaturesRecuesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return (
    <div>
      <CompanyOfferSubmissions id={id} />
    </div>
  );
}
