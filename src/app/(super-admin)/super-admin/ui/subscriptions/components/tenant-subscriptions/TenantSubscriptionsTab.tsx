export default function TenantSubscriptionsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Tenant Subscriptions</h2>
        <p className="text-sm text-slate-600">
          Review each tenant&apos;s active plan, renewal date, and status.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        This section will hold the tenant subscription table and filters.
      </div>
    </div>
  );
}
