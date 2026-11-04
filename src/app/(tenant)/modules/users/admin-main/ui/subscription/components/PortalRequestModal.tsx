"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type RequestType =
  | "ADD_PORTAL"
  | "DISABLE_PORTAL"
  | "ADD_FEATURE"
  | "DISABLE_FEATURE";

type PortalOption = {
  id: string;
  name: string;
  portalId?: string;
};

type FeatureOption = {
  id: string;
  name: string;
  portalId?: string;
  portalName?: string;
};

type PortalRequestModalProps = {
  onClose: () => void;
  features?: FeatureOption[];
  onSubmit?: (data: {
    requestType: RequestType;
    portalId?: string;
    name?: string;
    featureId?: string;
    reason: string;
  }) => void;
};

type PortalListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Array<{
      _id?: string;
      portalId?: string;
      portalName: string;
    }>;
  };
};

type FeatureListResponse = {
  success: boolean;
  message?: string;
  data?: Array<{
    portal: string;
    portalId?: string;
    featureId: string | null;
    featureName: string | null;
  }>;
  pagination?: {
    totalPages?: number;
  };
};

type PortalRequestResponse = {
  success?: boolean;
  message?: string;
};

const PortalRequestModal = ({
  onClose,
  features = [],
  onSubmit,
}: PortalRequestModalProps) => {
  const [portals, setPortals] = useState<PortalOption[]>([]);
  const [loadingPortals, setLoadingPortals] = useState(true);
  const [portalsError, setPortalsError] = useState<string | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<FeatureOption[]>(
    [],
  );
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [featuresError, setFeaturesError] = useState<string | null>(null);
  const [requestType, setRequestType] =
    useState<RequestType>("ADD_PORTAL");
  const [selectedPortalId, setSelectedPortalId] = useState("");
  const [name, setName] = useState("");
  const [featureId, setFeatureId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadPortals = async () => {
      setLoadingPortals(true);
      setPortalsError(null);
      try {
        const response = await axios.get<PortalListResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PORTAL.GET_ALL}?page=1&limit=1000`,
        );
        if (!response.data.success) {
          throw new Error(response.data.message || "Portal request failed.");
        }

        const items = response.data.data?.items;
        if (!Array.isArray(items)) {
          throw new Error("Portal list response did not contain an item list.");
        }

        const options = items.map((portal) => {
          const id = portal._id || portal.portalId;
          if (!id || !portal.portalName) {
            throw new Error(
              "A portal list item is missing its ID or portal name.",
            );
          }
          return {
            id,
            name: portal.portalName,
            portalId: portal.portalId,
          };
        });

        if (isCurrent) setPortals(options);
      } catch (error) {
        console.error("Failed to load portals for portal request:", error);
        if (isCurrent) {
          setPortalsError(
            error instanceof Error
              ? error.message
              : "Unable to load portals. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setLoadingPortals(false);
      }
    };

    void loadPortals();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadFeatures = async () => {
      setLoadingFeatures(true);
      setFeaturesError(null);
      try {
        const rows: NonNullable<FeatureListResponse["data"]> = [];
        let totalPages = 1;

        for (let page = 1; page <= totalPages; page += 1) {
          const response = await axios.get<FeatureListResponse>(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEATURE_CONTROL.GET_ALL}`,
            { params: { page, limit: 100 } },
          );
          if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error(
              response.data.message || "Feature list request failed.",
            );
          }

          rows.push(...response.data.data);
          if (page === 1) {
            totalPages = Math.max(
              1,
              Number(response.data.pagination?.totalPages) || 1,
            );
          }
        }

        const options = rows
          .filter(
            (row): row is typeof row & {
              portalId: string;
              featureId: string;
              featureName: string;
            } => Boolean(row.portalId && row.featureId && row.featureName),
          )
          .map((row) => ({
            id: row.featureId,
            name: row.featureName,
            portalId: row.portalId,
            portalName: row.portal,
          }));

        const portalIdsByName = new Map<string, string>();
        rows.forEach((row) => {
          if (row.portalId && row.portal) {
            portalIdsByName.set(row.portal.trim().toLowerCase(), row.portalId);
          }
        });

        if (isCurrent) {
          setAvailableFeatures(options);
          setPortals((currentPortals) =>
            currentPortals.map((portal) => ({
              ...portal,
              portalId:
                portalIdsByName.get(portal.name.trim().toLowerCase()) ??
                portal.portalId,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load features for portal request:", error);
        if (isCurrent) {
          setFeaturesError(
            error instanceof Error
              ? error.message
              : "Unable to load features. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setLoadingFeatures(false);
      }
    };

    void loadFeatures();
    return () => {
      isCurrent = false;
    };
  }, []);

  const isFeatureRequest =
    requestType === "ADD_FEATURE" || requestType === "DISABLE_FEATURE";
  const isAddRequest =
    requestType === "ADD_PORTAL" || requestType === "ADD_FEATURE";
  const requiresPortal =
    requestType === "DISABLE_PORTAL" || isFeatureRequest;
  const requiresFeature = requestType === "DISABLE_FEATURE";
  const selectedPortal = portals.find(
    (portal) => portal.id === selectedPortalId,
  );
  const selectedFeatures = [...features, ...availableFeatures].filter(
    (feature) => {
      if (feature.portalId && selectedPortal?.portalId) {
        return feature.portalId === selectedPortal.portalId;
      }
      if (feature.portalName) {
        return (
          feature.portalName.trim().toLowerCase() ===
          selectedPortal?.name.trim().toLowerCase()
        );
      }
      return true;
    },
  );
  const selectedFeature = selectedFeatures.find(
    (feature) => feature.id === featureId,
  );
  const requestPortalId =
    selectedFeature?.portalId || selectedPortal?.portalId;
  const missingPortalId =
    requiresPortal && Boolean(selectedPortalId) && !requestPortalId;

  const handleRequestTypeChange = (value: RequestType) => {
    setRequestType(value);
    setSelectedPortalId("");
    setName("");
    setFeatureId("");
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tenantId = localStorage.getItem("tenantId");
    const tenantName = localStorage.getItem("tenantName");
    const token = localStorage.getItem("AdminAuthToken");

    if (!tenantId || !tenantName) {
      setSubmitError("Tenant details are missing. Please sign in again.");
      return;
    }
    if (!token) {
      setSubmitError("Your session has expired. Please sign in again.");
      return;
    }
    if (requiresPortal && !requestPortalId) {
      setSubmitError(
        "The selected portal ID is missing from the feature-control list.",
      );
      return;
    }

    const payload = {
      tenantId,
      tenantName,
      requestType,
      requestReason: reason.trim(),
      ...(requestType === "ADD_PORTAL" ? { portalName: name.trim() } : {}),
      ...(requiresPortal
        ? { portalId: requestPortalId, portalName: selectedPortal?.name }
        : {}),
      ...(requestType === "ADD_FEATURE" ? { featureName: name.trim() } : {}),
      ...(requiresFeature
        ? { featureId, featureName: selectedFeature?.name }
        : {}),
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await axios.post<PortalRequestResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PORTAL_REQUEST.CREATE}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            tenantId,
          },
        },
      );
      if (response.data.success === false) {
        throw new Error(response.data.message || "Request submission failed.");
      }

      toast.success(
        response.data.message || "Portal request submitted successfully.",
      );
      onSubmit?.({
        requestType,
        ...(requiresPortal ? { portalId: requestPortalId } : {}),
        ...(isAddRequest ? { name: name.trim() } : {}),
        ...(requiresFeature ? { featureId } : {}),
        reason: reason.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit portal request:", error);
      const message = axios.isAxiosError<PortalRequestResponse>(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "Unable to submit portal request.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const portalPlaceholder = loadingPortals
    ? "Loading portals..."
    : portalsError
      ? "Unable to load portals"
      : portals.length === 0
        ? "No portals available"
        : "Select portal";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="portal-request-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl dark:bg-[#2e2e2e]"
        role="dialog"
      >
        <h2
          id="portal-request-title"
          className="text-base font-semibold text-black dark:text-white"
        >
          Portal Request
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mt-3 space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600">
            <label className="block text-sm font-medium text-[#10204a] dark:text-gray-200">
              Request Type
              <select
                value={requestType}
                onChange={(event) =>
                  handleRequestTypeChange(event.target.value as RequestType)
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#576cbc] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
              >
                <option value="ADD_PORTAL">Add Portal</option>
                <option value="DISABLE_PORTAL">Disable Portal</option>
                <option value="ADD_FEATURE">Add Feature</option>
                <option value="DISABLE_FEATURE">Disable Feature</option>
              </select>
            </label>

            {isAddRequest && (
              <>
                {isFeatureRequest && (
                  <label className="block text-sm font-medium text-[#10204a] dark:text-gray-200">
                    Select Portal
                    <select
                      value={selectedPortalId}
                      onChange={(event) => {
                        setSelectedPortalId(event.target.value);
                        setName("");
                        setFeatureId("");
                      }}
                      disabled={loadingPortals || portals.length === 0}
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#576cbc] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                    >
                      <option value="">{portalPlaceholder}</option>
                      {portals.map((portal) => (
                        <option key={portal.id} value={portal.id}>
                          {portal.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {(!isFeatureRequest || selectedPortalId) && (
                  <label className="block text-sm font-medium text-[#10204a] dark:text-gray-200">
                    {isFeatureRequest ? "Feature Name" : "Portal Name"}
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={
                        isFeatureRequest
                          ? "Enter feature name"
                          : "Enter portal name"
                      }
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#576cbc] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                    />
                  </label>
                )}
              </>
            )}

            {!isAddRequest && (
              <label className="block text-sm font-medium text-[#10204a] dark:text-gray-200">
                Select Portal
                <select
                  value={selectedPortalId}
                  onChange={(event) => {
                    setSelectedPortalId(event.target.value);
                    setFeatureId("");
                  }}
                  disabled={loadingPortals || portals.length === 0}
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#576cbc] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                >
                  <option value="">{portalPlaceholder}</option>
                  {portals.map((portal) => (
                    <option key={portal.id} value={portal.id}>
                      {portal.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {missingPortalId && (
              <p className="text-sm text-red-600" role="alert">
                Portal ID is missing for the selected portal.
              </p>
            )}

            {requiresFeature && selectedPortalId && (
              <label className="block text-sm font-medium text-[#10204a] dark:text-gray-200">
                Select Feature
                <select
                  value={featureId}
                  onChange={(event) => setFeatureId(event.target.value)}
                  disabled={loadingFeatures || selectedFeatures.length === 0}
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#576cbc] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                >
                  <option value="">
                    {loadingFeatures
                      ? "Loading features..."
                      : featuresError
                        ? "Unable to load features"
                        : selectedFeatures.length === 0
                          ? "No features available"
                          : "Select feature"}
                  </option>
                  {selectedFeatures.map((feature) => (
                    <option key={feature.id} value={feature.id}>
                      {feature.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {portalsError && requiresPortal && (
              <p className="text-sm text-red-600" role="alert">
                {portalsError}
              </p>
            )}
            {featuresError && requiresFeature && (
              <p className="text-sm text-red-600" role="alert">
                {featuresError}
              </p>
            )}

            <label className="block text-sm font-medium text-[#10204a] dark:text-gray-200">
              Reason for Request
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why you need this change..."
                rows={4}
                required
                className="mt-1 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#576cbc] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
              />
            </label>

            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}
          </div>

          <div className="mt-3 flex justify-end gap-3 border-t border-gray-200 pt-3 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-[#576cbc] px-5 py-2 text-sm font-medium text-[#576cbc] transition hover:bg-[#f4f6ff] disabled:opacity-50 dark:hover:bg-[#3a3a3a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (requiresPortal &&
                  (loadingPortals ||
                    loadingFeatures ||
                    portals.length === 0 ||
                    missingPortalId)) ||
                (requiresFeature &&
                  (loadingFeatures || selectedFeatures.length === 0))
              }
              className="rounded-md bg-[#576cbc] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#465ba5] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default PortalRequestModal;
