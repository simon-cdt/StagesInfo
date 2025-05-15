import StageDetailsScreen from "@/components/OfferDetails";

export default async function StageDetails({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <StageDetailsScreen id={id} />;
}
