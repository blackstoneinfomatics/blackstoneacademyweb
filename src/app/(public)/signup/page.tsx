import SectionPage from "@/app/_components/SectionPage";

export default function SignupPage() {
  return (
    <SectionPage
      title="Sign up"
      description="Public account creation flow for new tenants or staff members."
      routePath="/signup"
      highlights={["Create organization", "Invite members", "Connect billing"]}
    />
  );
}