import SectionPage from "@/app/_components/SectionPage";

export default function SuperAdminModulesPage() {
  return (
    <SectionPage
      title="Modules"
      description="Enable, disable, and govern platform modules globally."
      routePath="/super-admin/modules"
      highlights={["Auth module", "Users module", "Finance module"]}
    />
  );
}