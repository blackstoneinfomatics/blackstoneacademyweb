import SectionPage from "@/app/_components/SectionPage";

export default function PermissionsSettingsPage() {
  return (
    <SectionPage
      title="Permissions"
      description="Fine-grained access control for modules and actions."
      routePath="/settings/permissions"
      highlights={["Module access", "Action policies", "Role overrides"]}
    />
  );
}