"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Eye, Upload, X } from "lucide-react";
import { TeacherDocumentsProps } from "./teacherDetailsTypes";

type DocumentItem = {
  id: number;
  name: string;
  type: string;
  fileType: string;
  size: string;
  uploadedDate: string;
  isUploaded: boolean;
};

type ActionItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function ActionItem({
  icon,
  label,
  onClick,
}: ActionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#35415e] transition-colors hover:bg-[#f0f1f8] dark:text-gray-300 dark:hover:bg-[#454a57]"
    >
      {icon}
      {label}
    </button>
  );
}

export default function DocumentsTab({
  teacher,
  onViewResume,
}: TeacherDocumentsProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentUrlError, setDocumentUrlError] = useState<string | null>(null);

  const documents: DocumentItem[] = [
    {
      id: 1,
      name: "Resume / CV",
      type: "Profile",
      fileType: "PDF",
      size: "420 KB",
      uploadedDate: "14 Jan 2026",
      isUploaded: Boolean(teacher.uploadResume),
    },
    {
      id: 2,
      name: "Educational Certificates",
      type: "Education",
      fileType: "PDF",
      size: "2.1 MB",
      uploadedDate: "14 Jan 2026",
      isUploaded: false,
    },
    {
      id: 3,
      name: "Experience Certificates",
      type: "Employment",
      fileType: "PDF",
      size: "1.4 MB",
      uploadedDate: "14 Jan 2026",
      isUploaded: false,
    },
    {
      id: 4,
      name: "Government ID Proof",
      type: "Identity",
      fileType: "PDF",
      size: "420 KB",
      uploadedDate: "14 Jan 2026",
      isUploaded: false,
    },
    {
      id: 5,
      name: "Address Proof",
      type: "Identity",
      fileType: "PDF",
      size: "1.4 MB",
      uploadedDate: "14 Jan 2026",
      isUploaded: false,
    },
    {
      id: 6,
      name: "Bank Details Document",
      type: "Financial",
      fileType: "PDF",
      size: "2.1 MB",
      uploadedDate: "14 Jan 2026",
      isUploaded: false,
    },
  ];

  useEffect(() => {
    setDocumentUrl(null);
    setDocumentUrlError(null);
    if (selectedDocument?.id !== 1 || !teacher.uploadResume) return;

    let objectUrl: string | null = null;
    try {
      if (typeof teacher.uploadResume === "string") {
        const dataUrlMatch = teacher.uploadResume.match(
          /^data:([^;]+);base64,(.+)$/
        );
        if (dataUrlMatch) {
          const binary = atob(dataUrlMatch[2]);
          const bytes = Uint8Array.from(binary, (character) =>
            character.charCodeAt(0)
          );
          objectUrl = URL.createObjectURL(
            new Blob([bytes], { type: dataUrlMatch[1] })
          );
        } else if (/^https?:\/\//i.test(teacher.uploadResume)) {
          setDocumentUrl(teacher.uploadResume);
          return;
        } else {
          const binary = atob(teacher.uploadResume);
          const bytes = Uint8Array.from(binary, (character) =>
            character.charCodeAt(0)
          );
          objectUrl = URL.createObjectURL(
            new Blob([bytes], { type: "application/pdf" })
          );
        }
      } else if (teacher.uploadResume.data && teacher.uploadResume.type) {
        objectUrl = URL.createObjectURL(
          new Blob([new Uint8Array(teacher.uploadResume.data)], {
            type: teacher.uploadResume.type,
          })
        );
      }

      if (objectUrl) setDocumentUrl(objectUrl);
    } catch (error) {
      console.error("Could not preview teacher document:", error);
      setDocumentUrlError("This document could not be previewed.");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedDocument, teacher.uploadResume]);

  const handleView = (document: DocumentItem) => {
    setActiveMenu(null);

    if (document.id === 1) {
      onViewResume();
    }
  };

  const handleViewDetails = (document: DocumentItem) => {
    setActiveMenu(null);
    setSelectedDocument(document);
  };

  const handleUpload = (document: DocumentItem) => {
    setActiveMenu(null);
    console.log("Upload document:", document.name);

    // Open your upload modal here.
  };

  return (
    <section className="w-full rounded-xl bg-[#f0f1f8] dark:bg-[#272b35]">
      <div className="w-full overflow-x-auto rounded-md">
        <table className="w-full min-w-[800px] border-collapse text-left">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#49658d] text-white dark:bg-[#3d4e70]">
              <th className="w-[25%] px-3 py-4 text-xs font-medium">
                Document Name
              </th>

              <th className="w-[22%] px-3 py-4 text-xs font-medium">
                Document Type
              </th>

              <th className="w-[23%] px-3 py-4 text-xs font-medium">
                Uploaded Date
              </th>

              <th className="w-[20%] px-3 py-4 text-xs font-medium">
                Document Status
              </th>

              <th className="w-[10%] px-3 py-4 text-center text-xs font-medium">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {documents.map((document, index) => (
              <tr
                key={document.id}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-[#30343f]"
                    : "bg-[#f6f6f6] dark:bg-[#292d37]"
                }
              >
                {/* Document Name */}
                <td className="px-3 py-3">
                  <p className="text-[13px] font-medium text-[#010e30] dark:text-white">
                    {document.name}
                  </p>

                  <p className="mt-1 text-xs text-[#74809a] dark:text-gray-400">
                    {document.isUploaded
                      ? `${document.fileType} · ${document.size}`
                      : "-"}
                  </p>
                </td>

                {/* Document Type */}
                <td className="px-3 py-3 text-xs text-[#17223e] dark:text-gray-300">
                  {document.type}
                </td>

                {/* Uploaded Date */}
                <td className="px-3 py-3 text-xs text-[#17223e] dark:text-gray-300">
                  {document.isUploaded ? document.uploadedDate : "-"}
                </td>

                {/* Document Status */}
                <td className="px-3 py-3">
                  <DocumentStatus isUploaded={document.isUploaded} />
                </td>

                {/* Action */}
                <td className="relative px-3 py-3 text-center">
                  <button
                    type="button"
                    aria-label={`Actions for ${document.name}`}
                    aria-expanded={activeMenu === document.id}
                    onClick={() =>
                      setActiveMenu(
                        activeMenu === document.id ? null : document.id
                      )
                    }
                    className="inline-flex rounded-md p-1 text-[#626870] transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-[#454a57]"
                  >
                    <MoreVertical size={19} strokeWidth={2.5} />
                  </button>

                  {activeMenu === document.id && (
                    <>
                      {/* Close dropdown on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenu(null)}
                      />

                      <div
                        className={`absolute right-16 z-50 w-[120px] text-[13px] rounded-lg border border-[#e7eaf2] bg-white shadow-md dark:border-[#454a57] dark:bg-[#30343f] ${
                          index >= documents.length - 2
                            ? "bottom-10"
                            : "top-10"
                        }`}
                      >
                          <>
                            <ActionItem
                              icon={<Eye size={12} />}
                              label="View Details"
                              onClick={() => handleViewDetails(document)}
                            />
                          </>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDocument && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDocument(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-details-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#30343f]"
          >
            <header className="flex items-center justify-between border-b border-[#e7eaf2] px-5 py-4 dark:border-[#454a57]">
              <h2
                id="document-details-title"
                className="text-base font-semibold text-[#14203c] dark:text-white"
              >
                Document Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close document details"
                className="rounded-md p-1.5 text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#424957]"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 rounded-lg border border-[#e7eaf2] p-4 dark:border-[#454a57] sm:grid-cols-2">
                <DocumentDetail label="Document Name" value={selectedDocument.name} />
                <DocumentDetail label="Document Type" value={selectedDocument.type} />
                <DocumentDetail
                  label="Uploaded Date"
                  value={
                    selectedDocument.isUploaded
                      ? selectedDocument.uploadedDate
                      : "—"
                  }
                />
                <div>
                  <p className="mb-1 text-xs font-medium text-[#64748b] dark:text-gray-400">
                    Document Status
                  </p>
                  <DocumentStatus isUploaded={selectedDocument.isUploaded} />
                </div>
              </div>

              {selectedDocument.isUploaded ? (
                documentUrl ? (
                  <div className="overflow-hidden rounded-lg border border-[#e7eaf2] dark:border-[#454a57]">
                    <iframe
                      title={selectedDocument.name}
                      src={documentUrl}
                      className="h-[55vh] min-h-[320px] w-full"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#cbd5e1] p-8 text-center dark:border-[#555b68]">
                    <p className="text-sm font-medium text-[#334155] dark:text-white">
                      {documentUrlError ||
                        "The document is uploaded, but a preview is unavailable."}
                    </p>
                    <p className="mt-1 text-xs text-[#64748b] dark:text-gray-400">
                      {selectedDocument.fileType} · {selectedDocument.size}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleView(selectedDocument)}
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#596fbe] px-4 py-2 text-xs font-medium text-white hover:bg-[#485eae]"
                    >
                      <Eye size={14} />
                      Open document
                    </button>
                  </div>
                )
              ) : (
                <div className="rounded-lg border border-dashed border-[#cbd5e1] p-8 text-center dark:border-[#555b68]">
                  <p className="text-sm font-medium text-[#334155] dark:text-white">
                    No document uploaded
                  </p>
                  <p className="mt-1 text-xs text-[#64748b] dark:text-gray-400">
                    Upload this document to view it here.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUpload(selectedDocument)}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#596fbe] px-4 py-2 text-xs font-medium text-white hover:bg-[#485eae]"
                  >
                    <Upload size={14} />
                    Upload document
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function DocumentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-[#64748b] dark:text-gray-400">
        {label}
      </p>
      <p className="break-words text-sm text-[#17223e] dark:text-gray-200">
        {value}
      </p>
    </div>
  );
}

function DocumentStatus({
  isUploaded,
}: {
  isUploaded: boolean;
}) {
  return (
    <span
      className={`inline-flex min-w-[74px] items-center justify-center rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
        isUploaded
          ? "bg-[#e8fbf1] text-[#218838] dark:bg-green-500/10 dark:text-green-400"
          : "bg-[#fce9e9] text-[#ef2929] dark:bg-red-500/10 dark:text-red-400"
      }`}
    >
      {isUploaded ? "Upload" : "Not Upload"}
    </span>
  );
}