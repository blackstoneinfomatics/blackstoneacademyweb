import BaseSuperLayout from "../components/BaseSuperLayout";

export default function SuperAdminUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseSuperLayout>{children}</BaseSuperLayout>;
}