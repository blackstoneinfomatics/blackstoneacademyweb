import SectionPage from "@/app/_components/SectionPage";

export default function SubscriptionsSettingsPage() {
  return (
    <SectionPage
      title="Subscriptions"
      description="Tenant subscription and billing plan controls."
      routePath="/settings/subscriptions"
      highlights={["Current plan", "Upgrade path", "Renewal status"]}
    />
  );
}