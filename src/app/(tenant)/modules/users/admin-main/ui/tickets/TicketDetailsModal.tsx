"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Download, FileText, ChevronDown, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface TicketDetails {
    apiTicketId?: string;
    ticketId: string;
    role?: string;
    tenantName?: string;
    category?: string;
    priority: string;
    subject: string;
    createdOn?: string;
    resolvedOn?: string;
    description?: string;
    status?: string;
}

interface TicketActionResponse {
    success?: boolean;
    message?: string | string[];
    error?: string;
    details?: string | string[];
}

interface TenantUser {
    userId?: string;
    _id?: string;
    id?: string;
    name?: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

interface TenantUsersResponse {
    success?: boolean;
    message?: string | string[];
    data?: { users?: TenantUser[] } | TenantUser[];
    users?: TenantUser[];
}

interface TicketDetailsModalProps {
    ticket: TicketDetails;
    onClose: () => void;
    onUpdated: (status: "Acknowledged" | "Resolved" | "Forwarded") => void;
    priorityBadgeClass: (p: string) => string;
}

const resolveTenantId = (): string => {
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
        const value = localStorage.getItem(key)?.trim();
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

export default function TicketDetailsModal({ ticket, onClose, onUpdated, priorityBadgeClass }: TicketDetailsModalProps) {
    const [isPortalReady, setIsPortalReady] = useState(false);
    const [actionType, setActionType] = useState(() =>
        ticket.status?.toLowerCase() === "open" ? "Acknowledge" : "Close Ticket",
    );
    const [acknowledgementMessage, setAcknowledgementMessage] = useState("");

    // Form states for Resolve/Forward
    const [resolutionNote, setResolutionNote] = useState("");
    const [forwardSubject, setForwardSubject] = useState(ticket?.subject || "");
    const [forwardCategory, setForwardCategory] = useState("");
    const [forwardDescription, setForwardDescription] = useState("");
    const [superAdminUsers, setSuperAdminUsers] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState("");
    const [isLoadingSuperAdmins, setIsLoadingSuperAdmins] = useState(false);
    const [superAdminLoadError, setSuperAdminLoadError] = useState<string | null>(null);

    // Attachment states
    const [file, setFile] = useState<{ name: string; size: string } | null>({
        name: "refund-request.pdf",
        size: "156 KB",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notification states
    const [sendEmail, setSendEmail] = useState(true);
    const [sendInApp, setSendInApp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const normalizedStatus = ticket.status?.toLowerCase();
    const acknowledgeDisabled = Boolean(normalizedStatus && normalizedStatus !== "open");
    const resolveDisabled =
        normalizedStatus === "resolved" || normalizedStatus === "closed";
    const forwardDisabled =
        normalizedStatus === "resolved" ||
        normalizedStatus === "closed" ||
        normalizedStatus === "forwarded";
    const selectedActionDisabled =
        (actionType === "Acknowledge" && acknowledgeDisabled) ||
        (actionType === "Close Ticket" && resolveDisabled) ||
        (actionType === "Forward to Super Admin" && forwardDisabled);

    useEffect(() => {
        setIsPortalReady(true);
    }, []);

    useEffect(() => {
        if (actionType !== "Forward to Super Admin") return;

        const controller = new AbortController();
        const loadSuperAdmins = async () => {
            setIsLoadingSuperAdmins(true);
            setSuperAdminLoadError(null);
            setSuperAdminUsers([]);
            setSelectedRecipientId("");

            try {
                const token = localStorage.getItem("AdminAuthToken");
                if (!token) {
                    throw new Error("Your session has expired. Please sign in again.");
                }

                const tenantId = resolveTenantId();
                if (!tenantId) {
                    throw new Error("Unable to find the current tenant.");
                }

                const response = await fetch(
                    `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.TENANT.GET_USERS_BY_ROLE(tenantId, "SUPERADMIN")}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    },
                );
                const result: TenantUsersResponse = await response.json();

                if (!response.ok || result.success === false) {
                    const message = result.message;
                    throw new Error(
                        (Array.isArray(message) ? message.join(" ") : message) ||
                        `Unable to load Super Admin users (HTTP ${response.status}).`,
                    );
                }

                const users = Array.isArray(result.data)
                    ? result.data
                    : result.data?.users ?? result.users ?? [];
                setSuperAdminUsers(
                    users
                        .map((user) => {
                            const id = user.userId ?? user._id ?? user.id ?? "";
                            const name =
                                [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                                user.name ||
                                user.userName ||
                                user.email ||
                                "Unnamed user";
                            return { id, name };
                        })
                        .filter((user) => Boolean(user.id)),
                );
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") return;
                setSuperAdminLoadError(
                    error instanceof Error ? error.message : "Unable to load Super Admin users.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingSuperAdmins(false);
                }
            }
        };

        void loadSuperAdmins();
        return () => controller.abort();
    }, [actionType]);

    if (!ticket || !isPortalReady) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile({
                name: selectedFile.name,
                size: `${(selectedFile.size / 1024).toFixed(0)} KB`,
            });
        }
    };

    // Dynamic button text based on Action selection
    const getSubmitButtonText = () => {
        if (isSubmitting) return "Updating...";
        if (actionType === "Acknowledge") return "Acknowledgment";
        if (actionType === "Close Ticket") return "Close Ticket";
        if (actionType === "Forward to Super Admin") return "Forward to Super Admin";
        return "Submit";
    };

    const handleSubmit = async () => {
        if (selectedActionDisabled) {
            toast.info("This ticket action has already been completed.");
            return;
        }

        const isForwarding = actionType === "Forward to Super Admin";
        if (isForwarding && !selectedRecipientId) {
            toast.error("Please select a Super Admin to forward this ticket to.");
            return;
        }

        const isAcknowledging = actionType === "Acknowledge";
        const message = isAcknowledging ? acknowledgementMessage.trim() : resolutionNote.trim();
        if (!isForwarding && !message) {
            toast.error(
                isAcknowledging
                    ? "Please enter an acknowledgement message."
                    : "Please enter a resolution note.",
            );
            return;
        }

        const token = localStorage.getItem("AdminAuthToken");
        if (!token) {
            toast.error("Your session has expired. Please sign in again.");
            return;
        }

        const ticketId = ticket.apiTicketId || ticket.ticketId;
        const endpoint = isForwarding
            ? AppApiEndpoints.TICKET.FORWARD(ticketId)
            : isAcknowledging
                ? AppApiEndpoints.TICKET.ACKNOWLEDGE(ticketId)
                : AppApiEndpoints.TICKET.RESOLVE(ticketId);
        const payload = isForwarding
            ? { recipientRole: "SUPERADMIN", recipientIds: [selectedRecipientId] }
            : { message };

        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${endpoint}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                },
            );
            const result: TicketActionResponse = await response.json();
            // console.log(result, "what is the issue")

            if (!response.ok || result.success === false) {
                const errorMessage = result.message ?? result.details ?? result.error;
                throw new Error(
                    (Array.isArray(errorMessage)
                        ? errorMessage.join(" ")
                        : errorMessage) ||
                    `Unable to ${isForwarding ? "forward" : isAcknowledging ? "acknowledge" : "resolve"} ticket (HTTP ${response.status}).`,
                );
            }

            const updatedStatus = isForwarding
                ? "Forwarded"
                : isAcknowledging
                    ? "Acknowledged"
                    : "Resolved";
            toast.success(
                (Array.isArray(result.message) ? result.message.join(" ") : result.message) ||
                `Ticket ${updatedStatus.toLowerCase()} successfully.`,
            );
            onUpdated(updatedStatus);
            onClose();
        } catch (error) {
            console.error("Failed to update ticket:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to update ticket. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reusable render for the Attachment Upload field (Restored original SVG source)
    const renderAttachmentUpload = () => (
        <div className="w-full">
            <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Attachment</label>
            {file ? (
                <div className="flex items-center bg-[#E6F1FF] dark:bg-[#3A4570] border border-[#D1D5DB] dark:border-[#555] rounded-xl p-3 w-full">
                    <div className="w-[30px] h-[30px] shrink-0">
                        <img
                            src="/assets/images/admin-main-smessagess-tickets-raiseticket-attachemnt.svg"
                            alt="File"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="ml-4 flex flex-col flex-1">
                        <span className="text-[12px] font-medium text-[#101828] dark:text-white leading-tight">
                            {file.name}
                        </span>
                        <span className="text-[11px] text-[#6478C7] dark:text-[#A8B7E8] underline mt-1">
                            {file.size}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 p-2 transition-colors ml-auto"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-[60px] border border-dashed border-[#D1D5DB] dark:border-[#555] rounded-lg bg-[#F9FAFB] dark:bg-[#343434] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3A3A3A] transition-colors">
                    <div className="flex flex-col items-center justify-center">
                        <UploadCloud className="w-4 h-4 text-gray-400 dark:text-gray-500 mb-1" />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-[#576CBC] dark:text-[#A8B7E8]">Click to upload</span>
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                </label>
            )}
        </div>
    );

    const renderNotification = () => (
        <div className="w-full">
            <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Sent Notification</label>
            <div className="flex flex-row items-center gap-6 pt-1 h-[60px]">
                <label className="flex items-center gap-2 text-[12px] text-[#344054] dark:text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-[#576CBC] dark:text-[#7B92D9] focus:ring-[#576CBC]"
                    />
                    <div className="flex items-center gap-1.5 text-[#576CBC] dark:text-[#A8B7E8] font-medium">
                        Email
                    </div>
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#344054] dark:text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={sendInApp}
                        onChange={(e) => setSendInApp(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-[#576CBC] dark:text-[#7B92D9] focus:ring-[#576CBC]"
                    />
                    <div className="flex items-center gap-1.5 text-[#576CBC] dark:text-[#A8B7E8] font-medium">
                        In-App Notification
                    </div>
                </label>
            </div>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-md">
            <div className="max-h-[95vh] w-full max-w-[600px] overflow-y-auto scrollbar-none p-3">
                <div className="rounded-xl bg-white dark:bg-[#2C2C2C] shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-[16px] font-bold text-[#101828] dark:text-white">Ticket Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-5">

                    {/* Top Info Card */}
                    <div className="bg-[#FAFAFA] border border-[#EAECF0] rounded-xl p-5 dark:bg-[#343434] dark:border-[#4A4A4A]">
                        <h3 className="text-[14px] font-semibold text-[#344054] dark:text-gray-300 mb-4">Ticket Information</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2">
                            <div>
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Ticket ID</p>
                                <p className="text-[11px] font-medium text-[#313b56] dark:text-white">{ticket.ticketId}</p>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Role</p>
                                <p className="text-[12px] font-medium text-[#313b56] dark:text-white">{ticket.role}</p>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Name</p>
                                <p className="text-[12px] font-medium text-[#313b56] dark:text-white">{ticket.tenantName}</p>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Category</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Priority</p>
                                <span className={`inline-block px-2 py-[2px] rounded text-[11px] font-medium ${priorityBadgeClass(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Subject</p>
                                <p className="text-[11px] font-medium text-[#313b56] dark:text-white">{ticket.subject}</p>
                            </div>
                            <div>
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Created On</p>
                                <p className="text-[11px] font-medium text-[#313b56] dark:text-white">{ticket.createdOn}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Resolved</p>
                                <p className="text-[11px] font-medium text-[#313b56] dark:text-white">{ticket.resolvedOn}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                                <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-1">Description</p>
                                <p className="text-[11px] text-[#475467] dark:text-gray-300 leading-relaxed">
                                    {ticket.description || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Static Attachment Display */}
                        <div className="mt-4">
                            <p className="text-[12px] text-[#010e30] dark:text-gray-400 mb-2">Attachment</p>
                            <div className="flex items-center justify-between bg-white border border-[#EAECF0] rounded-lg p-3 dark:bg-[#2C2C2C] dark:border-[#555]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center dark:bg-red-900/20">
                                        <FileText size={16} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-medium text-[#101828] dark:text-white">refund-request.pdf</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">156 KB</p>
                                    </div>
                                </div>
                                <button className="text-[#576CBC] hover:bg-blue-50 p-2 rounded-md transition-colors dark:text-[#A8B7E8] dark:hover:bg-[#3A4570]">
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Dropdown */}
                    <div>
                        <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Action</label>
                        <div className="relative">
                            <select
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value)}
                                className="w-full appearance-none px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] dark:bg-[#343434] dark:border-[#555] dark:text-white"
                            >
                                <option value="Acknowledge" disabled={acknowledgeDisabled}>
                                    {normalizedStatus === "acknowledged"
                                        ? "Acknowledge (already completed)"
                                        : "Acknowledge"}
                                </option>
                                <option value="Close Ticket" disabled={resolveDisabled}>
                                    {resolveDisabled
                                        ? "Close Ticket (already completed)"
                                        : "Close Ticket"}
                                </option>
                                <option value="Forward to Super Admin" disabled={forwardDisabled}>
                                    {forwardDisabled
                                        ? normalizedStatus === "forwarded"
                                            ? "Forward to Super Admin (already forwarded)"
                                            : "Forward to Super Admin (unavailable for closed tickets)"
                                        : "Forward to Super Admin"}
                                </option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* ACKNOWLEDGE UI */}
                    {actionType === "Acknowledge" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Message</label>
                            <textarea
                                rows={4}
                                value={acknowledgementMessage}
                                onChange={(e) => setAcknowledgementMessage(e.target.value)}
                                placeholder="Add an acknowledgement message..."
                                className="w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] resize-none dark:bg-[#343434] dark:border-[#555] dark:text-white"
                            />
                            {renderNotification()}
                            <div className="flex items-start gap-3 bg-[#EEF2FB] rounded-lg p-3 mt-4 dark:bg-[#3A4570]">
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#576CBC] dark:bg-[#7B92D9] flex items-center justify-center shrink-0">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                </div>
                                <p className="text-[12px] text-[#344054] dark:text-gray-200">
                                    This message will be sent to the tenant and recorded in the ticket timeline.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CLOSE TICKET UI */}
                    {actionType === "Close Ticket" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                            <div>
                                <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Resolution Note</label>
                                <textarea
                                    rows={4}
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                    placeholder="The issue has been resolved successfully..."
                                    className="w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] resize-none dark:bg-[#343434] dark:border-[#555] dark:text-white placeholder:text-gray-400"
                                />
                            </div>

                            {/* ⭐ Attachment & Notification Layout for Close Ticket */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6">
                                {renderAttachmentUpload()}
                                {renderNotification()}
                            </div>

                            <div className="flex items-start gap-3 bg-[#EEF2FB] rounded-lg p-3 dark:bg-[#3A4570]">
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#576CBC] dark:bg-[#7B92D9] flex items-center justify-center shrink-0">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                </div>
                                <p className="text-[12px] text-[#344054] dark:text-gray-200">
                                    The student will be notified that the ticket has been resolved and closed.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* FORWARD TO SUPER ADMIN UI */}
                    {actionType === "Forward to Super Admin" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                            <div>
                                <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">
                                    Forward to Super Admin
                                </label>
                                <select
                                    value={selectedRecipientId}
                                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                                    disabled={isLoadingSuperAdmins || superAdminUsers.length === 0}
                                    className="w-full appearance-none px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#343434] dark:border-[#555] dark:text-white"
                                >
                                    <option value="">
                                        {isLoadingSuperAdmins
                                            ? "Loading Super Admin users..."
                                            : superAdminUsers.length
                                                ? "Select a Super Admin"
                                                : "No Super Admin users found"}
                                    </option>
                                    {superAdminUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                {superAdminLoadError && (
                                    <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                        {superAdminLoadError}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        value={forwardSubject}
                                        onChange={(e) => setForwardSubject(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] dark:bg-[#343434] dark:border-[#555] dark:text-white"
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Category</label>
                                    <div className="relative">
                                        <select
                                            value={forwardCategory}
                                            onChange={(e) => setForwardCategory(e.target.value)}
                                            className="w-full appearance-none px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] dark:bg-[#343434] dark:border-[#555] dark:text-white"
                                        >
                                            <option value="">Select category</option>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                                    </div>
                                </div> */}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-[#344054] dark:text-gray-300 mb-1.5">Description</label>
                                <textarea
                                    rows={4}
                                    value={forwardDescription}
                                    onChange={(e) => setForwardDescription(e.target.value)}
                                    placeholder="A student reported that the assignment page cannot be accessed..."
                                    className="w-full px-3 py-2.5 border border-[#D0D5DD] rounded-lg text-[13px] text-[#101828] focus:outline-none focus:border-[#576CBC] resize-none dark:bg-[#343434] dark:border-[#555] dark:text-white placeholder:text-gray-400"
                                />
                            </div>

                            {/* ⭐ Attachment & Notification Layout for Forward */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6">
                                {renderAttachmentUpload()}
                                {renderNotification()}
                            </div>

                            <div className="flex items-start gap-3 bg-[#EEF2FB] rounded-lg p-3 dark:bg-[#3A4570]">
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#576CBC] dark:bg-[#7B92D9] flex items-center justify-center shrink-0">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                </div>
                                <p className="text-[12px] text-[#344054] dark:text-gray-200">
                                    The ticket will be sent to the Super Admin, and the status will be changed to "Forwarded".
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F0F1F4] dark:border-[#4A4A4A]">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-md border border-[#576CBC] text-[#576CBC] text-[13px] font-medium hover:bg-[#EEF2FB] transition-colors dark:border-[#7B92D9] dark:text-[#A8B7E8] dark:hover:bg-[#3A4570]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => void handleSubmit()}
                        disabled={isSubmitting || selectedActionDisabled}
                        className="px-5 py-2 rounded-md bg-[#576CBC] text-white text-[13px] font-medium hover:bg-[#3a4f8a] transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#7B92D9] dark:hover:bg-[#6A82CC]"
                    >
                        {getSubmitButtonText()}
                    </button>
                </div>
            </div>
            </div>
        </div>,
        document.body,
    );
}