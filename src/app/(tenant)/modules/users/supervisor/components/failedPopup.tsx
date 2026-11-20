
import React, { useEffect } from "react";
type Props = {
  readonly onClose: () => void;
  readonly title: string;
  readonly autoClose?: boolean;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly actionDisabled?: boolean;
};
const FailedPopup = ({
  onClose,
  title,
  autoClose = true,
  actionLabel,
  onAction,
  actionDisabled = false,
}: Props) => {
  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose, autoClose]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 text-center dark:bg-[#1D1D1D]">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500 "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
          Failed!
        </h2>
        <p className="text-red-600 mb-6 text-sm dark:text-white">
          {title}
        </p>
        <div className="w-32 h-1 bg-red-800 my-6  rounded-full mx-auto"></div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className="mb-3 w-full rounded-md bg-[#576CBC] px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionDisabled ? "Opening authorization..." : actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 bg-[#CB4C4B] text-white rounded-md hover:bg-red-400 transition-colors w-full"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default FailedPopup;
