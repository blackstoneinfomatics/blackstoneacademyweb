import SectionPage from "@/app/_components/SectionPage";

export default function LoginPage() {
  return (
    <SectionPage
      title="Login"
      description="Authentication entry point for public users and tenants. Wire your auth form and provider here."
      routePath="/login"
      highlights={["Email and password sign-in", "SSO and OAuth ready", "Role-based post-login redirect"]}
    />
  );
}