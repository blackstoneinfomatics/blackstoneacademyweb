"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type ChatSource = "TENANT" | "SUPER_ADMIN";
type SendAccess = "EVERYONE" | "ADMIN_ONLY";

interface UserGroupDetailsProps {
  roomId: string;
  source: ChatSource;
  onClose: () => void;
  onDeleteGroup: () => Promise<void>;
}

interface GroupMember {
  userId: string;
  userName: string;
  role: string;
}

interface GroupUser {
  userId: string;
  name: string;
  role: string;
  course: string | null;
  isSelected: boolean;
}

interface GroupDetails {
  roomId: string;
  roomCode: string;
  type: string;
  source: ChatSource;
  groupName: string;
  description: string;
  sendAccess: SendAccess;
  canUpdate: boolean;
  members: GroupMember[];
}

interface ApiResponse {
  message?: string;
  data?: Record<string, unknown>;
}

const API_BASE = AppApiEndpoints.API_END_POINT;
const logApiRequest = (label: string, method: string, url: string, payload?: unknown) => {
  console.info(`[UserGroupDetails] ${label} request`, {
    method,
    url,
    ...(payload === undefined ? {} : { payload }),
  });
};

const logApiResponse = async (label: string, response: Response) => {
  let body: unknown = null;
  try {
    body = await response.clone().json();
  } catch {
    try {
      body = await response.clone().text();
    } catch (error) {
      body = `Unable to read response body: ${String(error)}`;
    }
  }
  console.info(`[UserGroupDetails] ${label} response`, {
    status: response.status,
    ok: response.ok,
    body,
  });
};

const getAuthHeaders = () => {
  const token = ["AdminAuthToken", "authToken", "token", "accessToken", "jwt"]
    .map((key) => window.localStorage.getItem(key)?.trim())
    .find(Boolean);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getUserId = () =>
  window.localStorage.getItem("AdminPortalUserId")
  || window.localStorage.getItem("AdminPortalId")
  || "";

const getTenantId = () => {
  const tenantKeys = [
    "tenantId",
    "tenantCode",
    "TenantId",
    "TENANT_ID",
    "selectedTenantId",
    "TENANT_CODE",
    "currentTenantId",
    "tenant",
  ];
  for (const key of tenantKeys) {
    const value = window.localStorage.getItem(key)?.trim();
    if (!value) continue;
    if (value.startsWith("{")) {
      try {
        const tenant = JSON.parse(value) as Record<string, unknown>;
        const tenantId = tenant.tenantId ?? tenant.tenantCode ?? tenant.id ?? tenant._id;
        if (tenantId) return String(tenantId);
      } catch {
        continue;
      }
    } else {
      return value;
    }
  }
  return "";
};

const readErrorMessage = async (response: Response) => {
  const text = await response.text();
  if (text) {
    try {
      const result = JSON.parse(text) as ApiResponse;
      if (result.message) return result.message;
    } catch {
      return text;
    }
  }
  return `Request failed (HTTP ${response.status}).`;
};

const normalizeGroupDetails = (data: Record<string, unknown>, roomId: string, source: ChatSource): GroupDetails => {
  if (
    typeof data.groupName !== "string"
    || typeof data.description !== "string"
    || (data.sendAccess !== "EVERYONE" && data.sendAccess !== "ADMIN_ONLY" && data.sendAccess !== "ADMINS")
  ) {
    throw new Error("The group details response was missing required group information.");
  }

  const members = Array.isArray(data.members)
    ? data.members
      .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === "object")
      .map((member) => ({
        userId: String(member.userId ?? member.tenantId ?? member._id ?? ""),
        userName: String(member.userName ?? member.tenantName ?? member.name ?? "Unnamed"),
        role: String(member.role ?? "Member"),
      }))
      .filter((member) => member.userId)
    : [];

  return {
    roomId: String(data.roomId ?? roomId),
    roomCode: String(data.roomCode ?? ""),
    type: String(data.type ?? "GROUP"),
    source: data.source === "SUPER_ADMIN" ? "SUPER_ADMIN" : source,
    groupName: data.groupName,
    description: data.description,
    sendAccess: data.sendAccess === "EVERYONE" ? "EVERYONE" : "ADMIN_ONLY",
    canUpdate: data.canUpdate === true,
    members,
  };
};

const UserGroupDetails = ({ roomId, source, onClose, onDeleteGroup }: UserGroupDetailsProps) => {
  const [details, setDetails] = useState<GroupDetails | null>(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [sendAccess, setSendAccess] = useState<SendAccess>("EVERYONE");
  const [activeTab, setActiveTab] = useState<"details" | "roles">("details");
  const [roleSearch, setRoleSearch] = useState("");
  const [tenantRoles, setTenantRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [memberSelectionChanges, setMemberSelectionChanges] = useState<Record<string, boolean>>({});
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersInfo, setUsersInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const userId = getUserId();
    setLoading(true);
    setError(null);
    setDetails(null);
    setSaveError(null);

    if (!roomId) {
      setError("Group ID is missing.");
      setLoading(false);
      return () => controller.abort();
    }
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const url = `${API_BASE}/user/chat/${encodeURIComponent(source)}/groups/${encodeURIComponent(roomId)}${query}`;
    logApiRequest("Get group details", "GET", url);
    void (async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        await logApiResponse("Get group details", response);
        if (!response.ok) throw new Error(await readErrorMessage(response));

        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || !("data" in result)) {
          throw new Error("The group details response was not in the expected format.");
        }
        const payload = (result as ApiResponse).data;
        if (!payload || typeof payload !== "object") {
          throw new Error("The group details response was not in the expected format.");
        }
        const normalized = normalizeGroupDetails(payload, roomId, source);
        setDetails(normalized);
        setGroupName(normalized.groupName);
        setDescription(normalized.description);
        setSendAccess(normalized.sendAccess);
        console.info("[UserGroupDetails] group details loaded", {
          roomId: normalized.roomId,
          source: normalized.source,
          canUpdate: normalized.canUpdate,
        });
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        console.error("[UserGroupDetails] Get group details failed", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load group details.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [roomId, source]);

  const canUpdate = details?.canUpdate === true;
  useEffect(() => {
    setMemberSelectionChanges({});
  }, [roomId]);

  useEffect(() => {
    const tenantId = getTenantId();
    if (!tenantId) {
      setTenantRoles([]);
      setSelectedRole("");
      setRolesError("Tenant ID not found in session.");
      setRolesLoading(false);
      return;
    }

    const controller = new AbortController();
    setRolesLoading(true);
    setRolesError(null);

    void (async () => {
      try {
        const url = `${API_BASE}/tenant-portal/${encodeURIComponent(tenantId)}/roles`;
        logApiRequest("Get tenant roles", "GET", url);
        const response = await fetch(
          url,
          {
            method: "GET",
            cache: "no-store",
            headers: getAuthHeaders(),
            signal: controller.signal,
          },
        );
        await logApiResponse("Get tenant roles", response);
        if (!response.ok) throw new Error(await readErrorMessage(response));

        const result: unknown = await response.json();
        if (
          !result
          || typeof result !== "object"
          || !("data" in result)
          || !Array.isArray((result as { data?: unknown }).data)
        ) {
          throw new Error("The tenant roles response was not in the expected format.");
        }

        const roleNames = Array.from(new Set(
          ((result as { data: unknown[] }).data)
            .filter((role): role is string => typeof role === "string" && Boolean(role.trim()))
            .map((role) => role.trim()),
        ));
        console.info("[UserGroupDetails] tenant roles loaded", { roles: roleNames });
        setTenantRoles(roleNames);
        setSelectedRole((currentRole) =>
          roleNames.includes(currentRole) ? currentRole : roleNames[0] ?? "",
        );
      } catch (roleFetchError) {
        if (roleFetchError instanceof DOMException && roleFetchError.name === "AbortError") return;
        console.error("[UserGroupDetails] Get tenant roles failed", roleFetchError);
        setTenantRoles([]);
        setSelectedRole("");
        setRolesError(roleFetchError instanceof Error ? roleFetchError.message : "Failed to load tenant roles.");
      } finally {
        if (!controller.signal.aborted) setRolesLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeTab !== "roles" || !selectedRole) {
      setGroupUsers([]);
      setUsersError(null);
      setUsersInfo(null);
      setUsersLoading(false);
      return;
    }

    const tenantId = getTenantId();
    const userId = getUserId();
    if (!tenantId || !userId) {
      setGroupUsers([]);
      setUsersInfo(null);
      setUsersError(!tenantId ? "Tenant ID not found in session." : "Admin user ID not found in session.");
      setUsersLoading(false);
      return;
    }

    const controller = new AbortController();
    setUsersLoading(true);
    setUsersError(null);
    setUsersInfo(null);
    setGroupUsers([]);

    void (async () => {
      try {
        const query = new URLSearchParams({
          tenantId,
          userId,
          payloadUserId: userId,
          role: selectedRole.trim().toUpperCase(),
          page: "1",
          limit: "100",
        });
        const url = `${API_BASE}/user/chat/${encodeURIComponent(source)}/groupuser/${encodeURIComponent(roomId)}?${query.toString()}`;
        logApiRequest("Get group members by role", "GET", url);
        const response = await fetch(
          url,
          {
            method: "GET",
            cache: "no-store",
            headers: getAuthHeaders(),
            signal: controller.signal,
          },
        );
        await logApiResponse("Get group members by role", response);
        if (!response.ok) throw new Error(await readErrorMessage(response));

        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || !("data" in result)) {
          throw new Error("The group users response was not in the expected format.");
        }
        const apiResponse = result as ApiResponse;
        const data = apiResponse.data;
        if (!data || !Array.isArray(data.members)) {
          throw new Error("The group users response was missing its members list.");
        }

        const users = data.members
          .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === "object")
          .map((member) => ({
            userId: String(member.userId ?? member.tenantId ?? member._id ?? ""),
            name: String(member.name ?? member.userName ?? member.tenantName ?? "Unnamed"),
            role: String(member.role ?? selectedRole),
            course: typeof member.course === "string" ? member.course : null,
            isSelected: member.isSelected === true,
          }))
          .filter((user) => user.userId);
        setGroupUsers(users);
        setUsersInfo(apiResponse.message || null);
        console.info("[UserGroupDetails] group members loaded", {
          roomId,
          source,
          role: selectedRole,
          count: users.length,
          members: users.map(({ userId: memberUserId, role, isSelected }) => ({
            userId: memberUserId,
            role,
            serverIsSelected: isSelected,
          })),
        });
      } catch (usersFetchError) {
        if (usersFetchError instanceof DOMException && usersFetchError.name === "AbortError") return;
        console.error("[UserGroupDetails] Get group members by role failed", usersFetchError);
        setGroupUsers([]);
        setUsersError(usersFetchError instanceof Error ? usersFetchError.message : "Failed to load group users.");
      } finally {
        if (!controller.signal.aborted) setUsersLoading(false);
      }
    })();

    return () => controller.abort();
  }, [activeTab, roomId, selectedRole, source]);

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    return tenantRoles.filter((role) => role.toLowerCase().includes(query));
  }, [roleSearch, tenantRoles]);
  const selectedRoleMemberCount = groupUsers.filter(
    (user) => memberSelectionChanges[user.userId] ?? user.isSelected,
  ).length;

  const stageMemberSelection = (user: GroupUser, isSelected: boolean) => {
    if (!canUpdate || saving) return;
    console.info("[UserGroupDetails] member selection staged", {
      userId: user.userId,
      role: user.role,
      isSelected,
      serverIsSelected: user.isSelected,
    });
    setMemberSelectionChanges((changes) => {
      if (isSelected === user.isSelected) {
        const nextChanges = { ...changes };
        delete nextChanges[user.userId];
        return nextChanges;
      }
      return { ...changes, [user.userId]: isSelected };
    });
  };

  const deleteGroup = async () => {
    if (!canUpdate || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteGroup();
    } catch (deleteFailure) {
      console.error("[UserGroupDetails] Delete group failed", deleteFailure);
      setDeleteError(deleteFailure instanceof Error ? deleteFailure.message : "Failed to delete the group.");
    } finally {
      setDeleting(false);
    }
  };

  const saveChanges = async () => {
    if (!details || !canUpdate || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      let membershipSaveUnconfirmed = false;
      const addUsers = Object.entries(memberSelectionChanges)
        .filter(([, isSelected]) => isSelected)
        .map(([userId]) => {
          const user = groupUsers.find((member) => member.userId === userId);
          if (!user) {
            throw new Error(`Could not find the selected group member ${userId}.`);
          }
          return {
            userId: user.userId,
            name: user.name,
            role: user.role,
            course: user.course,
          };
        });
      const removeUsers = Object.entries(memberSelectionChanges)
        .filter(([, isSelected]) => !isSelected)
        .map(([userId]) => ({ userId }));

      const updateRoom = async (payload: Record<string, unknown>) => {
        const url = `${API_BASE}/user/chat-room/${encodeURIComponent(source)}/${encodeURIComponent(roomId)}`;
        const requestBody = JSON.stringify(payload);
        console.info("[UserGroupDetails] PUT payload being sent", {
          url,
          roomId,
          source,
          payload: requestBody,
        });
        const response = await fetch(url, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: requestBody,
        });
        const responseText = await response.text();
        let result: unknown = null;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = responseText;
          }
        }

        console.info("[UserGroupDetails] PUT API response after save", {
          url,
          roomId,
          source,
          status: response.status,
          ok: response.ok,
          body: result,
        });
        if (!response.ok) {
          const apiMessage = result && typeof result === "object" && "message" in result
            ? result.message
            : null;
          const errorMessage = typeof apiMessage === "string" && apiMessage
            ? apiMessage
            : typeof result === "string" && result
              ? result
              : `Request failed (HTTP ${response.status}).`;
          throw new Error(errorMessage);
        }
        if (result && typeof result === "object") {
          const apiResult = result as { success?: unknown; statusCode?: unknown; message?: unknown };
          if (apiResult.success === false || (Number(apiResult.statusCode) >= 400)) {
            throw new Error(
              typeof apiResult.message === "string" && apiResult.message
                ? apiResult.message
                : "The group update was rejected.",
            );
          }
        }
        console.info("[UserGroupDetails] Update request accepted by API", {
          roomId,
          source,
          message: "Check the API response above; database persistence is determined by the backend.",
        });
        return result;
      };

      if (addUsers.length || removeUsers.length) {
        await updateRoom({
          ...(addUsers.length ? { addUsers } : {}),
          ...(removeUsers.length ? { removeUsers } : {}),
          updatedBy: "ADMIN",
        });

        const tenantId = getTenantId();
        const userId = getUserId();
        if (tenantId && userId && selectedRole) {
          const query = new URLSearchParams({
            tenantId,
            userId,
            payloadUserId: userId,
            role: selectedRole.trim().toUpperCase(),
            page: "1",
            limit: "100",
          });
          const url = `${API_BASE}/user/chat/${encodeURIComponent(source)}/groupuser/${encodeURIComponent(roomId)}?${query.toString()}`;
          console.info("[UserGroupDetails] Refreshing members after save", { url, roomId, source, role: selectedRole });
          const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: getAuthHeaders(),
          });
          const responseText = await response.text();
          let result: unknown = null;
          if (responseText) {
            try {
              result = JSON.parse(responseText);
            } catch {
              result = responseText;
            }
          }
          console.info("[UserGroupDetails] Members response after save", {
            roomId,
            source,
            role: selectedRole,
            status: response.status,
            ok: response.ok,
            body: result,
          });
          if (!response.ok) {
            const apiMessage = result && typeof result === "object" && "message" in result
              ? result.message
              : null;
            throw new Error(
              typeof apiMessage === "string" && apiMessage
                ? `Update succeeded, but the member list could not be refreshed: ${apiMessage}`
                : `Update succeeded, but the member list could not be refreshed (HTTP ${response.status}).`,
            );
          }
          if (
            !result
            || typeof result !== "object"
            || !("data" in result)
            || !result.data
            || typeof result.data !== "object"
            || !("members" in result.data)
            || !Array.isArray(result.data.members)
          ) {
            throw new Error("Update succeeded, but the refreshed member response did not include a members list.");
          }
          const refreshedUsers = result.data.members
            .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === "object")
            .map((member) => ({
              userId: String(member.userId ?? member.tenantId ?? member._id ?? ""),
              name: String(member.name ?? member.userName ?? member.tenantName ?? "Unnamed"),
              role: String(member.role ?? selectedRole),
              course: typeof member.course === "string" ? member.course : null,
              isSelected: member.isSelected === true,
            }))
            .filter((user) => user.userId);
          const expectedSelectionById = new Map(Object.entries(memberSelectionChanges));
          const mismatchedMembers = refreshedUsers.filter((user) =>
            expectedSelectionById.has(user.userId)
            && expectedSelectionById.get(user.userId) !== user.isSelected,
          );
          membershipSaveUnconfirmed = mismatchedMembers.length > 0;
          setGroupUsers(refreshedUsers.map((user) => ({
            ...user,
            isSelected: expectedSelectionById.get(user.userId) ?? user.isSelected,
          })));
          console.info("[UserGroupDetails] Members displayed after save", {
            roomId,
            source,
            role: selectedRole,
            count: refreshedUsers.length,
            members: refreshedUsers.map(({ userId: memberUserId, role, isSelected }) => ({
              userId: memberUserId,
              role,
              serverIsSelected: isSelected,
              displayedIsSelected: expectedSelectionById.get(memberUserId) ?? isSelected,
            })),
          });
          if (membershipSaveUnconfirmed) {
            console.error("[UserGroupDetails] Server member state does not match the requested update", {
              roomId,
              source,
              role: selectedRole,
              mismatches: mismatchedMembers.map((user) => ({
                userId: user.userId,
                requestedIsSelected: expectedSelectionById.get(user.userId),
                serverIsSelected: user.isSelected,
              })),
            });
          }
        } else {
          membershipSaveUnconfirmed = true;
          console.warn("[UserGroupDetails] Could not refresh members after save: missing tenantId, userId, or role.", {
            hasTenantId: Boolean(tenantId),
            hasUserId: Boolean(userId),
            role: selectedRole,
          });
        }
      }

      const groupDetailsChanged =
        groupName.trim() !== details.groupName
        || description.trim() !== details.description
        || sendAccess !== details.sendAccess;
      if (groupDetailsChanged) {
        await updateRoom({
          groupName: groupName.trim(),
          description: description.trim(),
          sendAccess,
          updatedBy: "ADMIN",
        });
      }

      setMemberSelectionChanges({});
      onClose();
    } catch (saveFailure) {
      console.error("[UserGroupDetails] Save group changes failed", saveFailure);
      setSaveError(saveFailure instanceof Error ? saveFailure.message : "Failed to update group details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-3 sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-group-details-title"
        className="flex max-h-[94vh] w-full max-w-[700px] flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-[#E6EAF2] bg-gradient-to-b from-[#EEF2FB] to-white px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[14px] bg-[#F3F4F6] text-[28px] font-semibold text-[#98A2B3] ring-2 ring-white shadow">
              {details?.groupName.charAt(0).toUpperCase() || "G"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="user-group-details-title" className="truncate text-[20px] font-bold text-[#101828]">
                {loading ? "Loading group details..." : details?.groupName || "Group details"}
              </h2>
              <p className="mt-1 truncate text-[14px] text-[#667085]">
                {details?.description || (loading ? "" : "No description")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[12px] font-semibold text-[#3B82F6]">● Group</span>
                <span className="rounded-full bg-[#FFF7E8] px-2.5 py-1 text-[12px] font-semibold text-[#B45309]">
                  {sendAccess === "ADMIN_ONLY" ? "🔒 Admins only" : "Everyone"}
                </span>
                {details?.roomCode && <span className="text-[12px] text-[#98A2B3]">#{details.roomCode}</span>}
                {details && (
                  <span className={`text-[12px] font-medium ${canUpdate ? "text-[#2F7A5C]" : "text-[#667085]"}`}>
                    {canUpdate ? "Can edit" : "View only"}
                  </span>
                )}
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close group details" className="self-start rounded-md p-2 text-[#667085] hover:bg-white/70">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>

        <nav className="mx-6 flex border-b border-[#E6EAF2]" aria-label="Group details tabs">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative px-4 py-3 text-[14px] font-medium ${activeTab === "details" ? "text-[#576CBC]" : "text-[#667085]"}`}
          >
            Details
            {activeTab === "details" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#576CBC]" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`relative px-4 py-3 text-[14px] font-medium ${activeTab === "roles" ? "text-[#576CBC]" : "text-[#667085]"}`}
          >
            Roles ({rolesLoading ? "…" : tenantRoles.length})
            {activeTab === "roles" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#576CBC]" />}
          </button>
        </nav>

        <div className="min-h-[220px] flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="py-12 text-center text-sm text-[#667085]">Loading group details...</p>
          ) : error ? (
            <p role="alert" className="py-8 text-center text-sm text-red-600">{error}</p>
          ) : activeTab === "details" ? (
            <div className="space-y-5">
              <label className="block text-[14px] font-medium text-[#101B41]">
                Group Name
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  disabled={!canUpdate}
                  className="mt-2 h-[52px] w-full rounded-[7px] border border-[#D0D5DD] px-4 text-[14px] font-normal outline-none focus:border-[#576CBC] disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </label>
              <label className="block text-[14px] font-medium text-[#101B41]">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={!canUpdate}
                  rows={3}
                  placeholder="Enter group description"
                  className="mt-2 w-full resize-none rounded-[7px] border border-[#D0D5DD] px-4 py-3 text-[14px] font-normal outline-none focus:border-[#576CBC] disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </label>
              <fieldset className="rounded-[9px] border border-[#E6EAF2] p-5">
                <legend className="px-1 text-[14px] font-semibold text-[#101B41]">Group Settings</legend>
                <p className="mb-4 text-[13px] text-[#667085]">Who can send messages</p>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {(["EVERYONE", "ADMIN_ONLY"] as const).map((option) => (
                    <label key={option} className={`flex items-center gap-2 text-[14px] text-[#101B41] ${canUpdate ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                      <input
                        type="radio"
                        name="group-send-access"
                        value={option}
                        checked={sendAccess === option}
                        onChange={() => setSendAccess(option)}
                        disabled={!canUpdate}
                        className="h-[18px] w-[18px] accent-[#576CBC]"
                      />
                      {option === "EVERYONE" ? "Everyone" : "Admins only"}
                    </label>
                  ))}
                </div>
              </fieldset>

              <section className="rounded-[8px] border border-[#F5D0D0] bg-[#FFF8F8] p-5">
                <h3 className="mb-1 text-[14px] font-bold text-[#D14343]">Delete Group</h3>
                <p className="mb-4 text-[14px] text-[#8C919C]">
                  Once deleted, this group and all messages will be permanently removed.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    disabled={!canUpdate || deleting}
                    onClick={() => {
                      setDeleteError(null);
                      setShowDeleteConfirm(true);
                    }}
                    className="h-[56px] rounded-[9px] border border-[#D14343] px-6 text-[16px] font-semibold text-[#D14343] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete Group
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-[48px] rounded-[8px] border border-[#D0D5DD] bg-white px-5 text-[14px] font-semibold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!canUpdate || deleting}
                      onClick={deleteGroup}
                      className="h-[48px] rounded-[8px] bg-[#D14343] px-5 text-[14px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Yes, Delete Group"}
                    </button>
                  </div>
                )}
                {deleteError && <p role="alert" className="mt-3 text-[13px] text-red-600">{deleteError}</p>}
              </section>
            </div>
          ) : (
            <div className="flex min-h-[220px] gap-4">
              <aside className="w-[180px] shrink-0 border-r border-[#E6EAF2] pr-3">
                <input
                  type="search"
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  placeholder="Search roles..."
                  className="mb-3 h-10 w-full rounded-md border border-[#D0D5DD] px-3 text-[13px] outline-none focus:border-[#576CBC]"
                />
                {rolesLoading ? (
                  <p className="px-2 py-3 text-[12px] text-[#98A2B3]">Loading roles...</p>
                ) : rolesError ? (
                  <p role="alert" className="px-2 py-3 text-[12px] text-red-600">{rolesError}</p>
                ) : filteredRoles.length ? (
                  filteredRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`mb-1 w-full rounded-md px-3 py-2 text-left text-[13px] ${
                        selectedRole === role
                          ? "bg-[#EEF2FB] font-semibold text-[#576CBC]"
                          : "text-[#667085] hover:bg-[#F8F9FC]"
                      }`}
                    >
                      {role}
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-3 text-[12px] text-[#98A2B3]">
                    {tenantRoles.length ? "No matching roles." : "No roles found."}
                  </p>
                )}
              </aside>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="truncate text-[14px] font-semibold text-[#101B41]">{selectedRole || "Members"}</h3>
                  {!usersLoading && !usersError && (
                    <span className="shrink-0 rounded-full bg-[#E6F0EC] px-2 py-1 text-[11px] font-semibold text-[#2F7A5C]">
                      {selectedRoleMemberCount} member{selectedRoleMemberCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {usersLoading ? (
                  <p className="py-8 text-center text-[13px] text-[#98A2B3]">Loading users...</p>
                ) : usersError ? (
                  <p role="alert" className="py-8 text-center text-[13px] text-red-600">{usersError}</p>
                ) : groupUsers.length ? (
                  groupUsers.map((user) => (
                    <div key={user.userId} className="flex items-center gap-3 rounded-lg border border-[#E6EAF2] p-3">
                      <input
                        type="checkbox"
                        checked={memberSelectionChanges[user.userId] ?? user.isSelected}
                        disabled={!canUpdate || saving}
                        aria-label={`${memberSelectionChanges[user.userId] ?? user.isSelected ? "Remove" : "Add"} ${user.name} ${memberSelectionChanges[user.userId] ?? user.isSelected ? "from" : "to"} group`}
                        onChange={(event) => {
                          stageMemberSelection(user, event.currentTarget.checked);
                        }}
                        className="h-4 w-4 shrink-0 accent-[#576CBC] disabled:cursor-not-allowed"
                      />
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FB] font-semibold text-[#576CBC]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-[#101B41]">{user.name}</p>
                        <p className="text-[12px] text-[#98A2B3]">{user.role}</p>
                      </div>
                      {user.course && (
                        <span className="max-w-[120px] truncate rounded bg-[#E0F2FE] px-2 py-1 text-[11px] font-semibold text-[#3B82F6]">
                          {user.course}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${user.name} from group`}
                        title={`Remove ${user.name} from group`}
                        disabled={
                          !canUpdate
                          || saving
                          || !(memberSelectionChanges[user.userId] ?? user.isSelected)
                        }
                        onClick={() => stageMemberSelection(user, false)}
                        className="ml-1 rounded-md p-2 text-[#D14343] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6m4 4v6m6-6v6" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="py-12 text-center text-[13px] text-[#98A2B3]">
                    {usersInfo || (selectedRole ? `No group members found for ${selectedRole}.` : "Select a role to view its members.")}
                  </p>
                )}
              </div>
            </div>
          )}
          {saveError && <p role="alert" className="mt-4 text-[13px] text-red-600">{saveError}</p>}
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#F0F1F4] bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="h-[50px] rounded-[7px] border border-[#576CBC] px-7 text-[14px] font-semibold text-[#576CBC] hover:bg-blue-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={saveChanges}
            disabled={!canUpdate || loading || saving || Boolean(error)}
            className="h-[50px] rounded-[7px] bg-[#576CBC] px-7 text-[14px] font-semibold text-white hover:bg-[#4659a3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Done"}
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
};

export default UserGroupDetails;
