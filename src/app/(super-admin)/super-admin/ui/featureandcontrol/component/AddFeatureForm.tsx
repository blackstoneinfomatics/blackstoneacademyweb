"use client";

import React from "react";
import { BsX } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";

export interface FeatureFormData {
  portal: string;
  portalId?: string;
  category: string;
  navigationType: "parent" | "child" | "feature";
  parentNavigation: string;
  parentNavigationName: string;
  childNavigationName: string;
  childNavigations: string[];
  featureName: string;
  parentModule: string;
  description: string;
  status: string;
}

export interface ParentModuleOption {
  id: string;
  name: string;
  children: { id: string; name: string }[];
}

export interface PortalOption {
  id: string;
  name: string;
}

export interface ChildModuleOption {
  id: string;
  name: string;
}

interface AddFeatureFormProps {
  formData: FeatureFormData;
  isLoading: boolean;
  portalOptions: PortalOption[];
  parentModuleOptions: ParentModuleOption[];
  childModuleOptions: ChildModuleOption[];
  onClose: () => void;
  onReset: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onNavigationTypeChange: (type: "parent" | "child" | "feature") => void;
  onParentModuleSelect: (moduleId: string) => void;
  onChildNavigationToggle: (childModuleId: string) => void;
}

const selectClassName =
  "w-full appearance-none px-3 py-2 pr-9 border border-[#D6D8DE] rounded-md text-[11px] text-[#17244A] bg-white focus:outline-none focus:border-[#5872C5]";
const inputClassName =
  "w-full px-3 py-2 border border-[#D6D8DE] rounded-md text-[11px] text-[#17244A] placeholder:text-gray-400 focus:outline-none focus:border-[#5872C5]";
const labelClassName = "block text-[12px] font-medium text-[#17244A] mb-1.5";

const AddFeatureForm = ({
  formData,
  isLoading,
  portalOptions,
  parentModuleOptions,
  childModuleOptions,
  onClose,
  onReset,
  onSubmit,
  onInputChange,
  onNavigationTypeChange,
  onParentModuleSelect,
  onChildNavigationToggle,
}: AddFeatureFormProps) => {
  const isModule = formData.category === "Module";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4">
      <div className="relative max-h-[95vh] w-full max-w-[700px] overflow-y-auto rounded-lg bg-white shadow-2xl">
        <button
          type="button"
          aria-label="Close add feature form"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-md p-1 text-gray-500 transition hover:bg-gray-100"
        >
          <BsX className="text-[22px]" />
        </button>

        <div className="px-5 pb-5 pt-4">
          <h2 className="mb-4 text-[16px] font-semibold text-[#101B3D]">
            Add Feature
          </h2>

          <form onSubmit={onSubmit} className="space-y-3">
            <section className="rounded-lg border border-[#DDE2EC] p-3.5">
              <h3 className="mb-3 text-[15px] font-semibold text-[#101B3D]">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label>
                  <span className={labelClassName}>Select Module</span>
                  <div className="relative">
                    <select
                      name="portal"
                      value={formData.portal}
                      onChange={onInputChange}
                      className={selectClassName}
                    >
                      <option value="">
                        {portalOptions.length
                          ? "Select module"
                          : "Loading modules..."}
                      </option>
                      {portalOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </label>
                <label>
                  <span className={labelClassName}>Select category</span>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={onInputChange}
                      className={selectClassName}
                    >
                      <option value="Module">Module</option>
                      <option value="Feature">Feature</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-[#DDE2EC] p-3.5">
              <h3 className="mb-3 text-[15px] font-semibold text-[#101B3D]">
                Navigation Menu Information
              </h3>

              {isModule && (
                <div className="mb-3 flex items-center gap-8">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#17244A]">
                    <input
                      type="radio"
                      name="navigationType"
                      checked={formData.navigationType === "parent"}
                      onChange={() => onNavigationTypeChange("parent")}
                      className="h-4 w-4 accent-[#5872C5]"
                    />
                    Parent Module
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#17244A]">
                    <input
                      type="radio"
                      name="navigationType"
                      checked={formData.navigationType === "child"}
                      onChange={() => onNavigationTypeChange("child")}
                      className="h-4 w-4 accent-[#5872C5]"
                    />
                    Child Module
                  </label>
                </div>
              )}

              {isModule && formData.navigationType === "parent" && (
                <>
                  <label className="mb-3 block">
                    <span className={labelClassName}>Parent Module Name</span>
                    <input
                      name="parentNavigationName"
                      value={formData.parentNavigationName}
                      onChange={onInputChange}
                      placeholder="Chat & Support"
                      className={inputClassName}
                    />
                  </label>
                  <div className="mb-3">
                    <span className={labelClassName}>
                      Existing Parent Modules (select one to add the feature
                      against it)
                    </span>
                    <div className="flex flex-wrap gap-2 rounded-md border border-[#D6D8DE] p-2.5">
                      {parentModuleOptions.length === 0 ? (
                        <span className="px-1 py-1 text-[11px] text-gray-400">
                          No parent modules yet
                        </span>
                      ) : (
                        parentModuleOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onParentModuleSelect(option.id)}
                            className={`rounded-md px-3 py-1.5 text-[11px] transition ${formData.parentModule === option.id ? "border border-[#5872C5] bg-[#E5EAFF] text-[#17244A]" : "bg-[#E5EAFF] text-[#17244A] hover:bg-[#DCE3FF]"}`}
                          >
                            {option.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <label className="mb-3 block">
                    <span className={labelClassName}>
                      Feature Name (optional - adds a feature directly under
                      this parent module)
                    </span>
                    <input
                      name="featureName"
                      value={formData.featureName}
                      onChange={onInputChange}
                      placeholder="Quick Chat"
                      className={inputClassName}
                    />
                  </label>
                </>
              )}

              {isModule && formData.navigationType === "child" && (
                <label className="mb-3 block">
                  <span className={labelClassName}>Parent Module</span>
                  <div className="relative">
                    <select
                      name="parentNavigation"
                      value={formData.parentNavigation}
                      onChange={onInputChange}
                      className={selectClassName}
                    >
                      <option value="">
                        {parentModuleOptions.length
                          ? "Select parent module"
                          : "Loading parent modules..."}
                      </option>
                      {parentModuleOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </label>
              )}

              {!isModule && (
                <>
                  <label className="mb-3 block">
                    <span className={labelClassName}>Parent Module</span>
                    <div className="relative">
                      <select
                        name="parentModule"
                        value={formData.parentModule}
                        onChange={onInputChange}
                        className={selectClassName}
                      >
                        <option value="">
                          {parentModuleOptions.length
                            ? "Select parent module"
                            : "Loading parent modules..."}
                        </option>
                        {parentModuleOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                  </label>

                  <div className="mb-3">
                    <span className={labelClassName}>Child Module</span>
                    <div className="flex flex-wrap gap-2 rounded-md border border-[#D6D8DE] p-2.5">
                      {!formData.parentModule ? (
                        <span className="px-1 py-1 text-[11px] text-gray-400">
                          Select a parent module first
                        </span>
                      ) : childModuleOptions.length === 0 ? (
                        <span className="px-1 py-1 text-[11px] text-gray-400">
                          No child modules under this parent
                        </span>
                      ) : (
                        childModuleOptions.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => onChildNavigationToggle(child.id)}
                            className={`rounded-md px-4 py-2 text-[11px] transition ${formData.childNavigations.includes(child.id) ? "border border-[#5872C5] bg-[#E5EAFF] text-[#17244A]" : "bg-[#E5EAFF] text-[#17244A] hover:bg-[#DCE3FF]"}`}
                          >
                            {child.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <label className="mb-3 block">
                    <span className={labelClassName}>Feature Name</span>
                    <input
                      name="featureName"
                      value={formData.featureName}
                      onChange={onInputChange}
                      placeholder="Video"
                      className={inputClassName}
                    />
                  </label>
                </>
              )}

              {isModule && formData.navigationType === "child" && (
                <label className="mb-3 block">
                  <span className={labelClassName}>Child Module Name</span>
                  <input
                    name="childNavigationName"
                    value={formData.childNavigationName}
                    onChange={onInputChange}
                    placeholder="Ticket"
                    className={inputClassName}
                  />
                </label>
              )}

              <label className="mb-3 block">
                <span className={labelClassName}>Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  placeholder="10"
                  rows={3}
                  className={`${inputClassName} resize-none`}
                />
              </label>
              <label className="block">
                <span className={labelClassName}>Status</span>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={onInputChange}
                    className={selectClassName}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </label>
            </section>

            <div className="flex justify-end gap-3 border-t border-[#E1E3E8] pt-3">
              <button
                type="button"
                onClick={onReset}
                className="rounded-md border border-[#5872C5] px-5 py-2 text-[11px] font-semibold text-[#5872C5] transition hover:bg-[#F2F4FF]"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-[#5872C5] px-6 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4D66B3] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFeatureForm;
