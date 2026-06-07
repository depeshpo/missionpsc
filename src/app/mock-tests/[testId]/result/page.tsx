import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function MockTestResultPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Mock test result"
      description="Score breakdown by subject."
      breadcrumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Result" }]}
    />
  );
}
