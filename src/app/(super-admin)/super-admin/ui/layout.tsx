"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import BaseSuperLayout from "../components/BaseSuperLayout";

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname?.replace(/\/$/, "") === "/super-admin/ui/login";

  return (
    <Suspense fallback={null}>
      {isLoginPage ? (
        children
      ) : (
        <BaseSuperLayout>{children}</BaseSuperLayout>
      )}
    </Suspense>
  );
}

export default function SuperAdminUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SuperAdminLayoutContent>{children}</SuperAdminLayoutContent>
    </Suspense>
  );
}