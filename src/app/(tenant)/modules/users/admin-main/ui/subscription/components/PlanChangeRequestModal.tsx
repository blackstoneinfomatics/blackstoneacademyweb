"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type PlanChangeRequestModalProps = {
  onClose: () => void;
};

type BillingPeriod = {
  billingPeriodId?: string;
  billingPeriod: string;
  duration: number;
  price: number;
  discount: number;
  gstRate: number;
  taxAmount: number;
  totalAmount: number;
};

type PlanOption = {
  planId: string;
  planName: string;
  billingPeriods: BillingPeriod[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const toNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const parseBillingPeriod = (value: unknown): BillingPeriod | null => {
  const row = asRecord(value);
  if (!row || typeof row.billingPeriod !== "string") return null;

  return {
    billingPeriodId:
      typeof row.billingPeriodId === "string" ? row.billingPeriodId : undefined,
    billingPeriod: row.billingPeriod,
    duration: toNumber(row.duration),
    price: toNumber(row.price),
    discount: toNumber(row.discount),
    gstRate: toNumber(row.gstRate),
    taxAmount: toNumber(row.taxAmount),
    totalAmount: toNumber(row.totalAmount),
  };
};

const parsePlan = (value: unknown): PlanOption | null => {
  const row = asRecord(value);
  if (!row || typeof row.planName !== "string") return null;

  const planId =
    typeof row.planId === "string"
      ? row.planId
      : typeof row._id === "string"
        ? row._id
        : null;
  if (!planId) return null;

  return {
    planId,
    planName: row.planName,
    billingPeriods: Array.isArray(row.billingPeriods)
      ? row.billingPeriods
          .map(parseBillingPeriod)
          .filter((period): period is BillingPeriod => period !== null)
      : [],
  };
};

const extractPlans = (responseData: unknown): PlanOption[] => {
  const root = asRecord(responseData);
  const data = asRecord(root?.data);
  const candidates =
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(root?.items) && root.items) ||
    (Array.isArray(root?.data) && root.data) ||
    (Array.isArray(responseData) && responseData) ||
    [];

  return candidates
    .map(parsePlan)
    .filter((plan): plan is PlanOption => plan !== null);
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const PlanChangeRequestModal = ({
  onClose,
}: PlanChangeRequestModalProps) => {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedBillingPeriodId, setSelectedBillingPeriodId] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadPlans = async () => {
      setLoadingPlans(true);
      setPlansError(null);
      try {
        const response = await axios.get<unknown>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.GET_ACTIVE_PLANS}`,
        );
        const availablePlans = extractPlans(response.data);
        if (isCurrent) {
          setPlans(availablePlans);
          setSelectedPlanId(availablePlans[0]?.planId ?? "");
          setSelectedBillingPeriodId(
            availablePlans[0]?.billingPeriods[0]?.billingPeriodId ??
              availablePlans[0]?.billingPeriods[0]?.billingPeriod ??
              "",
          );
          if (availablePlans.length === 0) {
            setPlansError("No active plans with billing details were returned.");
          }
        }
      } catch (error) {
        console.error("Failed to load active plans for plan change:", error);
        if (isCurrent) {
          setPlansError("Unable to load plans. Please close and try again.");
        }
      } finally {
        if (isCurrent) setLoadingPlans(false);
      }
    };

    void loadPlans();
    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.planId === selectedPlanId);
  const billingPeriods = selectedPlan?.billingPeriods ?? [];
  const selectedBillingPeriod = billingPeriods.find(
    (period) =>
      (period.billingPeriodId ?? period.billingPeriod) ===
      selectedBillingPeriodId,
  );

  const handlePlanChange = (planId: string) => {
    const nextPlan = plans.find((plan) => plan.planId === planId);
    setSelectedPlanId(planId);
    setSelectedBillingPeriodId(
      nextPlan?.billingPeriods[0]?.billingPeriodId ??
        nextPlan?.billingPeriods[0]?.billingPeriod ??
        "",
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="plan-change-request-title"
        aria-modal="true"
        className="w-full max-w-[532px] rounded-lg bg-white px-[15px] py-[17px] shadow-2xl dark:bg-[#2e2e2e]"
        role="dialog"
      >
        <h2
          className="mb-[10px] text-[15px] font-semibold text-[#111827] dark:text-white"
          id="plan-change-request-title"
        >
          Plan Change
        </h2>
        <form
          id="plan-change-request-form"
          onSubmit={(event) => event.preventDefault()}
          className="rounded-lg border border-[#e1e5ed] px-[13px] pb-[14px] pt-[12px] dark:border-[#505050]"
        >
          <div className="space-y-[10px]">
            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Current Plan
              <input
                aria-label="Current Plan"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none dark:border-[#555] dark:bg-[#252525] dark:text-white"
                readOnly
                value="Basic"
              />
            </label>

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              New Plan
              <select
                aria-label="New Plan"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                disabled={loadingPlans || plans.length === 0}
                onChange={(event) => handlePlanChange(event.target.value)}
                required
                value={selectedPlanId}
              >
                <option disabled value="">
                  {loadingPlans ? "Loading plans..." : "Select a plan"}
                </option>
                {plans.map((plan) => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.planName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Billing Cycle
              <select
                aria-label="Billing Cycle"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#555] dark:bg-[#252525] dark:text-white"
                disabled={billingPeriods.length === 0}
                onChange={(event) =>
                  setSelectedBillingPeriodId(event.target.value)
                }
                required
                value={selectedBillingPeriodId}
              >
                <option disabled value="">
                  {billingPeriods.length > 0
                    ? "Select a billing cycle"
                    : "No billing cycles available"}
                </option>
                {billingPeriods.map((period, index) => {
                  const value =
                    period.billingPeriodId ?? period.billingPeriod;
                  return (
                    <option key={`${value}-${index}`} value={value}>
                      {period.billingPeriod}
                      {period.duration > 0 ? ` - ${period.duration} Month${period.duration === 1 ? "" : "s"}` : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            {selectedBillingPeriod && (
              <div
                aria-live="polite"
                className="rounded-md bg-[#f5f7ff] px-3 py-2 text-[11px] text-[#253252] dark:bg-[#252f45] dark:text-[#e5e7eb]"
              >
                <div className="flex justify-between py-1">
                  <span>Price</span>
                  <span>{formatCurrency(selectedBillingPeriod.price)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Discount ({selectedBillingPeriod.discount}%)</span>
                  <span>
                    {formatCurrency(
                      (selectedBillingPeriod.price *
                        selectedBillingPeriod.discount) /
                        100,
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tax ({selectedBillingPeriod.gstRate}%)</span>
                  <span>{formatCurrency(selectedBillingPeriod.taxAmount)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-[#dce1eb] pt-2 font-semibold dark:border-[#505b70]">
                  <span>Total Amount</span>
                  <span>
                    {formatCurrency(selectedBillingPeriod.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {plansError && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                {plansError}
              </p>
            )}

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Plan Start Plan
              <input
                aria-label="Plan Start Plan"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                type="month"
                required
              />
            </label>

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Reason for Plan Change
              <select
                aria-label="Reason for Plan Change"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                defaultValue=""
                required
              >
                <option disabled value="">
                  Select reason
                </option>
                <option>Upgrade</option>
                <option>Downgrade</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Reason for Request
              <textarea
                className="mt-[5px] h-[86px] w-full resize-none rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] py-[7px] text-[10px] font-normal text-[#253252] outline-none placeholder:text-[#536078] focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white dark:placeholder:text-[#a3a3a3]"
                placeholder="Explain why you need this portal..."
                required
              />
            </label>
          </div>
        </form>

        <div className="my-[13px] h-px w-full bg-[#e1e1e1] dark:bg-[#505050]" />

        <div className="flex justify-end gap-[14px]">
          <button
            className="h-[32px] min-w-[75px] rounded-[6px] border border-[#5870c5] bg-white px-[16px] text-[12px] font-semibold text-[#5870c5] transition hover:bg-[#f4f6ff] dark:bg-transparent dark:hover:bg-[#3a3a3a]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-[32px] min-w-[75px] rounded-[6px] bg-[#5870c5] px-[16px] text-[12px] font-semibold text-white transition hover:bg-[#4d63b5] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loadingPlans || plans.length === 0 || !selectedBillingPeriod}
            form="plan-change-request-form"
            type="submit"
          >
            Submit
          </button>
        </div>
      </section>
    </div>
  );
};

export default PlanChangeRequestModal;
