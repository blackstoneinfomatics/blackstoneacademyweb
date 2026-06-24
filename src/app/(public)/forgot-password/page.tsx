import SectionPage from "@/app/_components/SectionPage";

export default function ForgotPasswordPage() {
  return (
    <SectionPage
      title="Forgot password"
      description="Password recovery flow for account access restoration."
      routePath="/forgot-password"
      highlights={["Request reset link", "Verify ownership", "Set a new password"]}
    />
  );
}