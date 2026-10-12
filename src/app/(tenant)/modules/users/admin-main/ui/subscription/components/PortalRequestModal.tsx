"use client";

import React from "react";

type PortalRequestModalProps = {
  onClose: () => void;
};

const PortalRequestModal = ({ onClose }: PortalRequestModalProps) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <section
      aria-labelledby="portal-request-title"
      aria-modal="true"
      className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-[#2e2e2e]"
      role="dialog"
    >
      <h2
        className="text-lg font-semibold text-[#10204a] dark:text-white"
        id="portal-request-title"
      >
        Portal Request
      </h2>
      <form className="mt-5">
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-300">
          Portal request form fields will be added when the request details are provided.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            className="rounded-lg border border-[#576cbc] px-4 py-2 text-sm font-medium text-[#576cbc] transition hover:bg-[#f4f6ff] dark:hover:bg-[#3a3a3a]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </form>
    </section>
  </div>
);

export default PortalRequestModal;
