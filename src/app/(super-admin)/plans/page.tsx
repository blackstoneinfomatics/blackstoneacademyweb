import SectionPage from "@/app/_components/SectionPage";

export default function PlansPage() {
  return (
    <SectionPage
      title="Plans"
      description="Define pricing tiers, billing limits, and feature availability."
      routePath="/super-admin/plans"
      highlights={["Tier management", "Feature gates", "Billing rules"]}
    />
  );
}