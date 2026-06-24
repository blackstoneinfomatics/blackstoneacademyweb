import SectionPage from "@/app/_components/SectionPage";

export default function BrandingSettingsPage() {
  return (
    <SectionPage
      title="Branding"
      description="Logo, colors, and tenant-specific visual identity controls."
      routePath="/settings/branding"
      highlights={["Logo upload", "Theme colors", "Brand assets"]}
    />
  );
}