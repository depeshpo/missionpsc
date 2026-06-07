import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function MockTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Mock test"
      description="Timed test player."
      breadcrumbs={[{ label: "Mock Tests", href: "/mock-tests" }, { label: "Test" }]}
    />
  );
}
