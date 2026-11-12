"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";

type PlanChangeRequestModalProps = {
  onClose: () => void;
};

type PlanOption = {
  planId: string;
  planName: string;
};

type CurrentSubscriptionResponse = {
  data?: {
    plan?: {
      planName?: string;
    };
  };
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const parsePlan = (value: unknown): PlanOption | null => {
  const row = asRecord(value);
  if (!row || typeof row.planName !== "string") return null;

  const planId =
    typeof row._id === "string"
      ? row._id
      : typeof row.planId === "string"
        ? row.planId
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
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [currentPlan, setCurrentPlan] = useState("");
  const [loadingCurrentPlan, setLoadingCurrentPlan] = useState(true);
  const [wantsPlanChange, setWantsPlanChange] = useState("");
  const [hasLoadedPlans, setHasLoadedPlans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const earliestStartDate = new Date();
  earliestStartDate.setMonth(earliestStartDate.getMonth() + 1, 1);
  const earliestStartMonth = `${earliestStartDate.getFullYear()}-${String(
    earliestStartDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  useEffect(() => {
    let isCurrent = true;

    const loadCurrentPlan = async () => {
      setLoadingCurrentPlan(true);
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) {
        setPlansError("Tenant ID not found. Please sign in again.");
        setLoadingCurrentPlan(false);
        return;
      }

      const token = localStorage.getItem("AdminAuthToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      try {
        const subscriptionResponse = await axios.get<CurrentSubscriptionResponse>(
          `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.TENANT.GET_TENANT_SUBSCRIPTION(tenantId)}`,
          { headers },
        );
        const currentPlanName = subscriptionResponse.data.data?.plan?.planName;

        if (isCurrent) {
          setCurrentPlan(currentPlanName ?? "");
          if (!currentPlanName) {
            setPlansError("Current subscription plan was not returned.");
          }
        }
      } catch (error) {
        if (isCurrent) {
          const message = axios.isAxiosError(error)
            ? String(error.response?.data?.message ?? error.message)
            : "Unable to load current subscription.";
          setPlansError(message);
        }
      } finally {
        if (isCurrent) setLoadingCurrentPlan(false);
      }
    };

    void loadCurrentPlan();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (wantsPlanChange !== "yes" || loadingCurrentPlan || !currentPlan || hasLoadedPlans) {
      return;
    }

    let isCurrent = true;
    const loadPlans = async () => {
      setLoadingPlans(true);
      setPlansError(null);
      const token = localStorage.getItem("AdminAuthToken");

      try {
        const response = await axios.get<unknown>(
          `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.PLAN.GET_ACTIVE_PLANS}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        );
        const availablePlans = extractPlans(response.data);
        const selectablePlans = availablePlans.filter(
          (plan) => plan.planName !== currentPlan,
        );

        if (isCurrent) {
          setPlans(availablePlans);
          setSelectedPlanId(selectablePlans[0]?.planId ?? "");
          setHasLoadedPlans(true);
          if (availablePlans.length === 0) {
            setPlansError("No active plans were returned.");
          } else if (selectablePlans.length === 0) {
            setPlansError("There are no other active plans available to request.");
          }
        }
      } catch (error) {
        if (isCurrent) {
          const message = axios.isAxiosError(error)
            ? String(error.response?.data?.message ?? error.message)
            : "Unable to load active plans.";
          setPlansError(message);
        }
      } finally {
        if (isCurrent) setLoadingPlans(false);
      }
    };

    void loadPlans();
    return () => {
      isCurrent = false;
    };
  }, [wantsPlanChange, loadingCurrentPlan, currentPlan, hasLoadedPlans]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (wantsPlanChange !== "yes") {
      setSubmitError("Select Yes to request a plan change.");
      return;
    }

    const tenantId = localStorage.getItem("tenantId");
    const selectedPlan = plans.find((plan) => plan.planId === selectedPlanId);
    if (!tenantId || !currentPlan || !selectedPlan) {
      setSubmitError("Tenant, current plan, or requested plan is unavailable.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const startMonth = String(formData.get("planStartDate") ?? "");
    const changeReason = String(formData.get("changeReason") ?? "");
    const requestReason = String(formData.get("requestReason") ?? "").trim();
    const token = localStorage.getItem("AdminAuthToken");
    const tenantName =
      localStorage.getItem("tenantName") ||
      localStorage.getItem("TenantName") ||
      tenantId;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.PLAN.CREATE_PLAN_CHANGE_REQUEST}`,
        {
          tenantId,
          tenantName,
          currentPlan,
          newPlan: selectedPlan.planName,
          planStartDate: `${startMonth}-01`,
          changeReason,
          requestReason,
        },
        {
          headers: {
            "tenantid": tenantId,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      toast.success("Plan change request submitted successfully.");
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? String(error.response?.data?.message ?? error.response?.data?.error ?? error.message)
        : "Unable to submit the plan change request.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#e1e5ed] px-[13px] pb-[14px] pt-[12px] dark:border-[#505050]"
        >
          <div className="space-y-[10px]">
            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Current Plan
              <input
                aria-label="Current Plan"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none dark:border-[#555] dark:bg-[#252525] dark:text-white"
                readOnly
                value={loadingCurrentPlan ? "Loading current plan..." : currentPlan}
              />
            </label>

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Want to change the plan?
              <select
                aria-label="Want to change the plan?"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                disabled={loadingCurrentPlan}
                onChange={(event) => {
                  setWantsPlanChange(event.target.value);
                  setSubmitError(null);
                  if (event.target.value === "no") {
                    setSelectedPlanId("");
                  }
                }}
                required
                value={wantsPlanChange}
              >
                <option disabled value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            {wantsPlanChange === "yes" && (
              <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
                New Plan
                <select
                  aria-label="New Plan"
                  className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                  disabled={loadingPlans || plans.length === 0 || !currentPlan}
                  onChange={(event) => handlePlanChange(event.target.value)}
                  required
                  value={selectedPlanId}
                >
                  <option disabled value="">
                    {loadingPlans ? "Loading plans..." : "Select a plan"}
                  </option>
                  {plans.map((plan) =>
                    plan.planName === currentPlan ? null : (
                      <option key={plan.planId} value={plan.planId}>
                        {plan.planName}
                      </option>
                    ),
                  )}
                </select>
              </label>
            )}

            {plansError && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                {plansError}
              </p>
            )}

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Plan Starts from
              <input
                aria-label="Plan Start Plan"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                type="month"
                name="planStartDate"
                min={earliestStartMonth}
                required
              />
            </label>

            <label className="block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">
              Reason for Plan Change
              <select
                aria-label="Reason for Plan Change"
                className="mt-[5px] h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[9px] text-[10px] text-[#253252] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white"
                defaultValue=""
                name="changeReason"
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
                name="requestReason"
                required
              />
            </label>
          </div>
          {submitError && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400" role="alert">
              {submitError}
            </p>
          )}
        </form>

        <div className="my-[13px] h-px w-full bg-[#e1e1e1] dark:bg-[#505050]" />

        <div className="flex justify-end gap-[14px]">
          <button
            className="h-[32px] min-w-[75px] rounded-[6px] border border-[#5870c5] bg-white px-[16px] text-[12px] font-semibold text-[#5870c5] transition hover:bg-[#f4f6ff] dark:bg-transparent dark:hover:bg-[#3a3a3a]"
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-[32px] min-w-[75px] rounded-[6px] bg-[#5870c5] px-[16px] text-[12px] font-semibold text-white transition hover:bg-[#4d63b5] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loadingCurrentPlan || (wantsPlanChange === "yes" && (loadingPlans || plans.length === 0 || !currentPlan)) || isSubmitting}
            form="plan-change-request-form"
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default PlanChangeRequestModal;
