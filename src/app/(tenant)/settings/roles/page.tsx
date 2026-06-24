import SectionPage from "@/app/_components/SectionPage";

export default function RolesSettingsPage() {
  return (
    <SectionPage
      title="Roles"
      description="Define tenant roles and map them to access boundaries."
      routePath="/settings/roles"
      highlights={["Role templates", "Role assignment", "Scope rules"]}
    />
  );
}