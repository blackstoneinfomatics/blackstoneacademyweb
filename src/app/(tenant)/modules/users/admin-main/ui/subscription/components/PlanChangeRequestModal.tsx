"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type PlanChangeRequestModalProps = {
  onClose: () => void;
};

type PlanOption = {
  planId: string;
  planName: string;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

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

const PlanChangeRequestModal = ({
  onClose,
}: PlanChangeRequestModalProps) => {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");

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

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
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
            disabled={loadingPlans || plans.length === 0}
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
