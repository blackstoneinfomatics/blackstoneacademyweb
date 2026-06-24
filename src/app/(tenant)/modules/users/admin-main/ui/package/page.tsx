"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";

// Type Definitions

type PackageName = "Simple" | "Essential" | "Premium" | "Elite";
const PACKAGE_NAMES: PackageName[] = [
  "Simple",
  "Essential",
  "Premium",
  "Elite",
];

type FeatureCategory =
  | "Teachers"
  | "Academics"
  | "Portal"
  | "Scheduling"
  | "Discounts";

type PackageDetails = {
  cost: string;
  Discounts: string[];
  Teachers: string[];
  Academics: string[];
  Portal: string[];
  Scheduling: string[];
} & { [key in FeatureCategory]: string[] };

type PackagesMap = {
  [key in PackageName]: PackageDetails;
};

const defaultFeatures: Omit<PackageDetails, "cost" | "Discounts"> = {
  Teachers: [
    "Expert Arabic (Native) Teacher",
    "Institutionally Certified",
    "Top 5 Star Rated Teacher",
  ],
  Academics: [
    "E-Certificate",
    "Direct Chat with Teacher & Coach",
    "Dedicated Academic Coach",
    "Coaching and Planning Session every Quarterly",
    "Progress Report Every Year",
  ],
  Portal: [
    "Full Dashboard Access",
    "Knowledge Base Access",
    "Assignments",
    "Recorded Classes",
    "Progress Report Every Year",
  ],
  Scheduling: [
    "Unlimited Reschedule of Class Per Month",
    "Unlimited Lesson Reschedule",
  ],
};

const packageFeatures: PackagesMap = PACKAGE_NAMES.reduce((acc, name) => {
  acc[name] = {
    cost: "",
    ...defaultFeatures,
    Discounts:
      name === "Simple"
        ? ["0% Discount for Family"]
        : ["10% Discount for Family"],
  };
  return acc;
}, {} as PackagesMap);

export default function PackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState<PackageName>("Simple");
  const [showPackageModal, setShowPackageModal] = useState(false);

  return (
    <BaseLayout4>
      <AdminHeader currentSection="package" showBackButton={true} showBackPath="courses"/>
      <div className="flex-1 overflow-auto scrollbar-none">
        <div className="flex justify-between mb-3 items-center">
          {showPackageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
                <h3 className="text-lg font-semibold text-[#002b4d] mb-4">
                  Add New Package
                </h3>

                <div className="space-y-4">
                  {/* Package Name */}
                  <div>
                    <label
                      htmlFor="pack"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Package Name
                    </label>
                    <input
                      type="text"
                      placeholder="Package Name"
                      className="w-full border rounded-lg px-4 py-2 text-sm"
                    />
                  </div>

                  {/* Cost Per Hour */}
                  <div>
                    <label
                      htmlFor="cost"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Cost Per Hour
                    </label>
                    <div className="flex items-center border rounded-lg px-4 py-2 text-sm">
                      <input
                        type="number"
                        placeholder="Cost Per Hour"
                        className="w-full outline-none"
                      />
                      <span className="ml-2">$</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Category
                    </label>
                    <select className="w-full border rounded-lg px-4 py-2 text-sm">
                      <option>Select Category</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </select>
                  </div>

                  {/* Description Point */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-600 mb-1"
                    >
                      Description Point
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter description..."
                        className="w-full border rounded-lg px-4 py-2 text-sm pr-10"
                      />
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-[#002b4d] text-white rounded-full flex items-center justify-center text-xs"
                        onClick={() => {
                          // your logic to add the description point
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowPackageModal(false)}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-[#002b4d] text-white rounded-lg text-sm hover:bg-[#001f36]">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex space-x-6">
            {PACKAGE_NAMES.map((pkg) => (
              <button
                key={pkg}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative text-lg font-medium pb-1 transition-all ${
                  selectedPackage === pkg
                    ? "text-[#576CBC] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#576CBC] after:rounded-full"
                    : "text-[#0F172A] dark:text-[#ffff]"
                }`}
              >
                {pkg}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label
            htmlFor="uvuvu"
            className="block mb-1 font-medium text-sm text-[#010E30] dark:text-[#ffff]"
          >
            Cost Per Hour
          </label>
          <div className="relative">
            <span className="absolute left-2 top-2 text-xs">$</span>
            <input
              type="text"
              value={packageFeatures[selectedPackage].cost}
              readOnly
              className="pl-6 pr-3 py-1.5 border rounded-md w-[280px] text-xs bg-[#FFFFFF] dark:bg-[#2C2C2C]"
            />
          </div>
        </div>

        <FeatureSection
          title="Teachers"
          features={packageFeatures[selectedPackage].Teachers}
        />
        <FeatureSection
          title="Academics"
          features={packageFeatures[selectedPackage].Academics}
        />
        <FeatureSection
          title="Portal Access"
          features={packageFeatures[selectedPackage].Portal}
        />
        <FeatureSection
          title="Scheduling"
          features={packageFeatures[selectedPackage].Scheduling}
        />
        <FeatureSection
          title="Discounts"
          features={packageFeatures[selectedPackage].Discounts}
        />

        <div className="flex justify-end space-x-3 mt-5 text-xs">
          <button className="px-3 py-2 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition ">
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition">
            Save
          </button>
        </div>
      </div>
    </BaseLayout4>
  );
}

function FeatureSection({
  title,
  features,
}: Readonly<{ title: string; features: string[] }>) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium text-sm text-[#010E30] dark:text-[#ffff]">
          {title}
        </h3>
        <button className="text-gray-500">
          <Edit2 size={16} className="text-[#010E30]" />
        </button>
      </div>
      <div className="bg-[#FFFFFF] dark:bg-[#2C2C2C] border rounded-md p-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-start py-1 text-sm dark:text-[#ffff]"
          >
            <input type="checkbox" className="mt-1 mr-2  accent-[#576CBC]" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
