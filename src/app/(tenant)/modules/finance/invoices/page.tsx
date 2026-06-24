import SectionPage from "@/app/_components/SectionPage";

export default function InvoicesPage() {
  return (
    <SectionPage
      title="Invoices"
      description="Tenant invoice list and billing history."
      routePath="/modules/finance/invoices"
      highlights={["Issued invoices", "Outstanding balances", "Payment status"]}
    />
  );
}