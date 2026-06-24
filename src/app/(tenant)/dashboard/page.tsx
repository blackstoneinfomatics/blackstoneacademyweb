import SectionPage from "@/app/_components/SectionPage";

export default function TenantDashboardPage() {
  return (
    <SectionPage
      title="Tenant dashboard"
      description="Default client landing page after authentication."
      routePath="/dashboard"
      highlights={["Live metrics", "Announcements", "Quick actions"]}
    />
  );
}