import SectionPage from "@/app/_components/SectionPage";

export default function SuperAdminDashboardPage() {
  return (
    <SectionPage
      title="Super-admin dashboard"
      description="Central control panel for tenants, plans, modules, and analytics."
      routePath="/super-admin/dashboard"
      highlights={["Tenant overview", "Subscription monitoring", "Platform analytics"]}
    />
  );
}