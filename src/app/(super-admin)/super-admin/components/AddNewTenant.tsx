"use client";

import { Check } from "lucide-react";
import { useState } from "react";

type Props = {
  readonly onClose: () => void;
};
const steps = [
  "Basic Information",
  "Contact",
  "Subscription",
  "Review",
];

export default function AddNewTenant({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const stepNumber = index + 1;

        const completed = stepNumber < currentStep;
        const active = stepNumber === currentStep;

        return (
          <div
            key={step}
            className={`flex items-center ${
              index !== steps.length - 1 ? "flex-1" : ""
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                ${
                  completed || active
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {completed ? <Check size={18} /> : stepNumber}
              </div>

              <p
                className={`mt-2 text-xs whitespace-nowrap ${
                  active
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {step}
              </p>
            </div>

            {index !== steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  completed
                    ? "bg-indigo-600"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}