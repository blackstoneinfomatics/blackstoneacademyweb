"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, FileText } from "lucide-react";

interface ViewTicket {
    ticketId?: string;
    role?: string;
    tenantName?: string;
    category?: string;
    priority: string;
    subject?: string;
    createdOn?: string;
    resolvedOn?: string;
    description?: string;
    message?: string;
    acknowledgementMessage?: string;
    status?: string;
}

interface ViewTicketModalProps {
    ticket: ViewTicket | null;
    onClose: () => void;
    priorityBadgeClass: (p: string) => string;
}

export default function ViewTicketModal({ ticket, onClose, priorityBadgeClass }: ViewTicketModalProps) {
    const [mounted, setMounted] = useState(false);

    // Ensure this only runs on the client to prevent SSR errors
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!ticket || !mounted) return null;

    const modalContent = (
        // 🚨 OVERLAY: Covers the entire screen
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 m-0 backdrop-blur-sm">
            <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-xl bg-white dark:bg-[#2C2C2C] shadow-2xl border border-transparent dark:border-[#444]">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#2C2C2C] border-b border-transparent dark:border-[#444]">
                    <h2 className="text-[17px] font-semibold text-[#010e30] dark:text-white">Ticket Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-6 pt-4">
                    {/* Top Info Card */}
                    <div className="bg-[#FAFAFA] border border-[#EAECF0] rounded-xl p-5 dark:bg-[#343434] dark:border-[#4A4A4A]">
                        <h3 className="text-[14px] font-medium text-[#192543] dark:text-gray-300 mb-4">Ticket Information</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2">
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Ticket ID</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.ticketId}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Role</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.role}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Name</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.tenantName}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Category</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Priority</p>
                                <span className={`inline-block px-2 py-[2px] rounded text-[10px] font-medium ${priorityBadgeClass(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Subject</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.subject}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Created On</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.createdOn}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Description</p>
                                <p className="text-[10px] text-[#475467] dark:text-gray-300 leading-relaxed">
                                    {ticket.description || "I am unable to access the assignment page. It displays a '404 Page Not Found' error whenever I click the assignment link. Please investigate and resolve the issue as soon as possible."}
                                </p>
                            </div>
                        </div>

                        {/* Attachment */}
                        <div className="mt-4">
                            <p className="text-[11px] text-[#010e30] dark:text-gray-400 mb-2">Attachment</p>
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

                    {/* Acknowledgement Card */}
                    <div className="bg-[#FAFAFA] border border-[#EAECF0] rounded-xl p-5 dark:bg-[#343434] dark:border-[#4A4A4A]">
                        <h3 className="text-[14px] font-medium text-[#192543] dark:text-gray-300 mb-4">Acknowledgement</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2">
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Resolved Date</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.resolvedOn}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Name</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.tenantName}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Role</p>
                                <p className="text-[10px] font-medium text-[#313b56] dark:text-white">{ticket.role}</p>
                            </div>
                            <div>
                                <p className="text-[13px] text-[#010e30] dark:text-gray-400 mb-1">Status</p>
                                <p className="text-[#076CCE] rounded text-[10px] font-medium">
                                    {ticket.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <h3 className="text-[14px] font-semibold text-[#344054] dark:text-gray-300 mb-2">Message</h3>
                        <textarea
                            value={ticket.message || ticket.acknowledgementMessage || ""}
                            readOnly
                            rows={4}
                            placeholder="No message available"
                            aria-label="Ticket message"
                            className="w-full resize-y rounded-lg border border-[#EAECF0] bg-white p-3 text-[13px] text-[#475467] outline-none dark:border-[#4A4A4A] dark:bg-[#343434] dark:text-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}