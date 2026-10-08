import { Suspense } from "react";


export default function TenantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <Suspense fallback={null}>{children}</Suspense>
    </main>
  );
}