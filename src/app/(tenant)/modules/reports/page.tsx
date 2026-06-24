import SectionPage from "@/app/_components/SectionPage";

export default function ReportsPage() {
  return (
    <SectionPage
      title="Reports"
      description="Tenant reporting center for operational and academic exports."
      routePath="/modules/reports"
      highlights={["Academic reports", "Finance reports", "Usage exports"]}
    />
  );
}