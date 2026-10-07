import BrandProfileEditClient from "@/components/brandProfiles/BrandProfileEditClient";

/**
 * Full Brand profile create: name, structured fields, and brief in one submit.
 */
export default function BrandProfileNewPage() {
  return <BrandProfileEditClient mode="create" />;
}
