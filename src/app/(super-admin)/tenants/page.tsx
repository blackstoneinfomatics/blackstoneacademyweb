import SectionPage from "@/app/_components/SectionPage";

export default function TenantsPage() {
  return (
    <SectionPage
      title="Tenants"
      description="Manage client organizations, onboarding, and lifecycle settings."
      routePath="/super-admin/tenants"
      highlights={["Create tenant", "Suspend tenant", "View usage and status"]}
    />
  );
}