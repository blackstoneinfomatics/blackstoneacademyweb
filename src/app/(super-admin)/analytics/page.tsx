import SectionPage from "@/app/_components/SectionPage";

export default function SuperAdminAnalyticsPage() {
  return (
    <SectionPage
      title="Analytics"
      description="Operational and product analytics for the full platform."
      routePath="/super-admin/analytics"
      highlights={["Revenue trends", "Tenant activity", "Module usage"]}
    />
  );
}