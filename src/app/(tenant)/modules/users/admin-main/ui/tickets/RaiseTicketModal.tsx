"use client";

import React, { useState } from "react";
import { X, ChevronDown, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface CreateTicketResponse {
    success?: boolean;
    message?: string;
    data?: {
        ticketNumber?: string;
    };
}

interface RaiseTicketModalProps {
    onClose: () => void;
}

export default function RaiseTicketModal({ onClose }: RaiseTicketModalProps) {
    const [formData, setFormData] = useState({
        subject: "",
        priority: "Medium",
        category: "TECHNICAL_ISSUE",
        description: "",
    });

    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile({
                name: selectedFile.name,
                size: `${(selectedFile.size / 1024).toFixed(0)} KB`,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.subject.trim() ||
            !formData.category ||
            !formData.priority ||
            !formData.description.trim()
        ) {
            toast.error("Please complete all required ticket fields.");
            return;
        }
        if (file) {
            toast.error("Attachments are not supported by the ticket API yet.");
            return;
        }

        const token = localStorage.getItem("AdminAuthToken");
        if (!token) {
            toast.error("Your session has expired. Please sign in again.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}/tickets`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        subject: formData.subject.trim(),
                        category: formData.category,
                        priority: formData.priority,
                        description: formData.description.trim(),
                        attachments: [],
                    }),
                },
            );

            const result: CreateTicketResponse = await response.json();
            if (!response.ok || result.success !== true) {
                throw new Error(
                    result.message || `Ticket submission failed (HTTP ${response.status}).`,
                );
            }

            toast.success(
                result.data?.ticketNumber
                    ? `Ticket ${result.data.ticketNumber} created successfully.`
                    : result.message || "Ticket created successfully.",
            );
            onClose();
        } catch (error) {
            console.error("Failed to create ticket:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to submit ticket. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-[#2C2C2C] rounded-xl overflow-hidden flex flex-col shadow-lg border border-transparent dark:border-[#4A4A4A]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-transparent dark:border-[#4A4A4A]">
                <h2 className="text-[18px] font-semibold text-[#1a1a1a] dark:text-white">Raise Ticket</h2>
                <button
                    onClick={onClose}
                    type="button"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-6">
                <div className="border border-[#E2E8F0] dark:border-[#4A4A4A] rounded-xl p-5 space-y-5 bg-transparent dark:bg-[#343434]">
                    <form id="raise-ticket-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Row 1: Subject & Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[14px] font-medium text-[#1a1a1a] dark:text-gray-300 mb-1.5">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Enter ticket subject"
                                    className="w-full px-3 py-2 border border-[#D1D5DB] dark:border-[#555] rounded-md text-[13px] text-[#1a1a1a] dark:text-white bg-white dark:bg-[#2C2C2C] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#576CBC] focus:ring-1 focus:ring-[#576CBC]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium text-[#1a1a1a] dark:text-gray-300 mb-1.5">
                                    Priority
                                </label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-[#D1D5DB] dark:border-[#555] rounded-md text-[13px] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#576CBC] appearance-none bg-white dark:bg-[#2C2C2C]"
                                    >
                                        <option value="" disabled>Select priority</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Category & Related To */}
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[14px] font-medium text-[#1a1a1a] dark:text-gray-300 mb-1.5">
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-[#D1D5DB] dark:border-[#555] rounded-md text-[13px] text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#576CBC] appearance-none bg-white dark:bg-[#2C2C2C]"
                                    >
                                        <option value="" disabled>Select category</option>
                                        <option value="TECHNICAL_ISSUE">Technical Issue</option>
                                        <option value="STUDENT_MANAGEMENT">Student Management</option>
                                        <option value="TEACHER_MANAGEMENT">Teacher Management</option>
                                        <option value="ADMIN_MANAGEMENT">Admin Management</option>
                                        <option value="ATTENDANCE_MANAGEMENT">Attendance Management</option>
                                        <option value="PAYMENT_INVOICE">Payment / Invoice</option>
                                        <option value="SUBSCRIPTION_PLAN">Subscription Plan</option>
                                        <option value="FEATURE_REQUEST">Feature Request</option>
                                        <option value="OTHERS">Others</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[14px] font-medium text-[#1a1a1a] dark:text-gray-300 mb-2.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe your issue in detail..."
                                className="w-full px-3 py-2 border border-[#D1D5DB] dark:border-[#555] rounded-md text-[13px] text-[#1a1a1a] dark:text-white bg-white dark:bg-[#2C2C2C] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#576CBC] resize-none"
                            />
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="block text-[14px] font-medium text-[#1a1a1a] dark:text-gray-300 mb-2.5">
                                Attachment
                            </label>

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
                                <label className="flex flex-col items-center justify-center w-full h-[80px] border border-dashed border-[#D1D5DB] dark:border-[#555] rounded-md bg-[#F9FAFB] dark:bg-[#343434] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3A3A3A] transition-colors">
                                    <div className="flex flex-col items-center justify-center">
                                        <UploadCloud className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-1" />
                                        <p className="text-[13px] text-gray-500 dark:text-gray-400">
                                            <span className="font-medium text-[#576CBC] dark:text-[#A8B7E8]">Click to upload</span> or drag and drop
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F1F5F9] dark:border-[#4A4A4A] bg-white dark:bg-[#2C2C2C]">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-md border border-[#576CBC] text-[#576CBC] dark:border-[#7B92D9] dark:text-[#A8B7E8] text-[14px] font-medium hover:bg-[#EEF2FB] dark:hover:bg-[#3A4570] transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="raise-ticket-form"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-md bg-[#576CBC] dark:bg-[#7B92D9] text-white text-[14px] font-medium hover:bg-[#3a4f8a] dark:hover:bg-[#6A82CC] transition-colors"
                >
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
            </div>
        </div>
    );
}