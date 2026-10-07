import BrandProfileEditClient from "@/components/brandProfiles/BrandProfileEditClient";

type BrandProfileEditPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Brand profile edit route: name, structured fields, active brief.
 */
export default async function BrandProfileEditPage({
  params,
}: BrandProfileEditPageProps) {
  const { id } = await params;
  return <BrandProfileEditClient mode="edit" profileId={id} />;
}
