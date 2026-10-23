"use client";

import React from "react";
import { X, Download, FileText } from "lucide-react";

interface ViewTicketModalProps {
    ticket: any;
    onClose: () => void;
    priorityBadgeClass: (p: string) => string;
}

export default function ViewTicketModal({ ticket, onClose, priorityBadgeClass }: ViewTicketModalProps) {
    if (!ticket) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
            <div className="max-h-[95vh] w-full max-w-[600px] overflow-y-auto scrollbar-none rounded-xl bg-white dark:bg-[#2C2C2C] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-[18px] font-bold text-[#101828] dark:text-white">Ticket Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-6">
                    {/* Top Info Card */}
                    <div className="bg-[#FAFAFA] border border-[#EAECF0] rounded-xl p-5 dark:bg-[#343434] dark:border-[#4A4A4A]">
                        <h3 className="text-[14px] font-semibold text-[#344054] dark:text-gray-300 mb-4">Ticket Information</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2">
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Ticket ID</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.ticketId}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Role</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.role}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Name</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.tenantName}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Category</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                                <span className={`inline-block px-2 py-[2px] rounded text-[11px] font-medium ${priorityBadgeClass(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.subject}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Created On</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.createdOn}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Resolved</p>
                                <p className="text-[13px] font-medium text-[#101828] dark:text-white">{ticket.resolvedOn}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-[13px] text-[#475467] dark:text-gray-300 leading-relaxed">
                                    {ticket.description || "I am unable to access the assignment page. It displays a '404 Page Not Found' error whenever I click the assignment link. Please investigate and resolve the issue as soon as possible."}
                                </p>
                            </div>
                        </div>

                        {/* Attachment */}
                        <div className="mt-4">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">Attachment</p>
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

                    {/* Acknowledgement Message */}
                    <div>
                        <h3 className="text-[14px] font-semibold text-[#344054] dark:text-gray-300 mb-2">Message</h3>
                        <div className="border border-[#EAECF0] rounded-lg p-4 bg-white dark:bg-[#343434] dark:border-[#4A4A4A]">
                            <p className="text-[13px] text-[#475467] dark:text-gray-300">
                                Today Update day
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}