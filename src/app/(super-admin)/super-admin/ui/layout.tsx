import { Suspense } from "react";
import BaseSuperLayout from "../components/BaseSuperLayout";


export default function SuperAdminUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseSuperLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </BaseSuperLayout>
  );
}