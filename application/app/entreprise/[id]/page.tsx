import CandidaturesRecues from "@/components/table/candidatures";
import React from "react";

export default async function CandidaturesRecuesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return (
    <div>
      <CandidaturesRecues id={id} />
    </div>
  );
}
