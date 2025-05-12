import StageDetailsScreen from "@/components/DetailsOffre";

export default async function StageDetails({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return <StageDetailsScreen id={id} />;
}
