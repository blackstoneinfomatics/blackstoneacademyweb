"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      closeButton={false}
      theme="colored"
      toastClassName="rounded-xl shadow-md px-5 py-4 font-medium text-sm bg-white dark:bg-[#1f1f1f] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
      className="text-sm leading-snug"
    />
  );
}