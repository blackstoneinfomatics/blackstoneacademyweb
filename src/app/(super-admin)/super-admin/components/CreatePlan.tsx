"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  readonly onClose: () => void;
};

const steps = [1, 2, 3, 4];

const features = [
  "Student Management",
  "Attendance",
  "Dashboard",
  "Reports",
  "Fees",
  "Exams",
  "Library",
  "Transport",
  "Staff",
  "Parent Portal",
  "Notification",
  "Inventory",
];

const variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // smooth ease
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
    },
  }),
};

const CreatePlan = ({ onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const next = () => {
    setDirection(1);
    if (step < 4) setStep(step + 1);
  };

  const back = () => {
    setDirection(-1);
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        transition={{
          duration: 0.35,
        }}
        className="bg-white rounded-xl w-full max-w-xl shadow-xl"
      >
        {" "}
        {/* Header */}
        <div className="relative p-2">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={15} />
          </button>
        </div>
        {/* Stepper */}
        <div className="px-8 pt-6">
          <div className="flex items-center">
            {steps.map((item, index) => (
              <React.Fragment key={item}>
                <div className="flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      backgroundColor:
                        step >= index + 1 ? "#576CBC" : "#D4D4D4",
                      color: step >= index + 1 ? "#FFFFFF" : "#5E5E5E",
                      scale: step === index + 1 ? 1.15 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  >
                    {item}
                  </motion.div>
                </div>

                {index !== steps.length - 1 && (
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: step > index + 1 ? "#576CBC" : "#D4D4D4",
                    }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="flex-1 h-[2px]"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="p-6 min-h-[430px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              layout
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {" "}
              {/* STEP 1 */}
              {step === 1 && (
                <div className="gap-5 w-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Basic Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* Plan Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="col-span-2"
                    >
                      <label className="block text-sm font-medium mb-2">
                        Plan Name
                      </label>

                      <input
                        placeholder="Premium Plus"
                        className="w-full h-8 text-xs rounded-lg border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC]"
                      />
                    </motion.div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Role
                      </label>

                      <select className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2">
                        <option>Admin</option>
                        <option>Teacher</option>
                        <option>Student</option>
                      </select>
                    </div>

                    {/* Student Limit */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Student Limit
                      </label>

                      <select className="w-full h-8 text-xs rounded-lg border border-[#D4D4D4] px-2">
                        <option>1 - 100</option>
                        <option>100 - 300</option>
                      </select>
                    </div>

                    {/* Billing Cycle */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-3">
                        Billing Cycle
                      </label>

                      <div className="grid grid-cols-4 gap-2">
                        {["Monthly", "3 Month", "6 Month", "Yearly"].map(
                          (item) => (
                            <label
                              key={item}
                              className="h-8 border border-[#D4D4D4] rounded-sm flex items-center px-2 gap-2 cursor-pointer hover:border-[#576CBC]"
                            >
                              <input
                                type="radio"
                                name="billing"
                                className="accent-[#576CBC]"
                              />
                              <span className="text-xs">{item}</span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Plan Description
                      </label>

                      <textarea
                        placeholder="Advanced plan for growing institutions with all essential features."
                        className="w-full rounded-sm border border-[#D4D4D4] p-2 text-xs resize-none"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Status
                      </label>

                      <select className="w-full h-8 rounded-lg border border-[#D4D4D4] px-2 text-xs">
                        <option>Active</option>
                      </select>
                    </div>

                    {/* Plan Status */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Plan Status
                      </label>

                      <select className="w-full h-8 rounded-lg border border-[#D4D4D4] px-2 text-xs">
                        <option>Most Popular</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {/* STEP 2 */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label>Monthly Price</label>
                    <input
                      className="mt-2 w-full border rounded-md px-3 py-2"
                      placeholder="$344"
                    />
                  </div>

                  <div>
                    <label>Yearly Price</label>
                    <input
                      className="mt-2 w-full border rounded-md px-3 py-2"
                      placeholder="$2444"
                    />
                  </div>

                  <div>
                    <label>Setup Fee</label>
                    <input
                      className="mt-2 w-full border rounded-md px-3 py-2"
                      placeholder="$3"
                    />
                  </div>

                  <div>
                    <label>Free Trial Days</label>
                    <input
                      className="mt-2 w-full border rounded-md px-3 py-2"
                      placeholder="14"
                    />
                  </div>

                  <div className="col-span-2">
                    <label>GST / Tax</label>
                    <input
                      className="mt-2 w-full border rounded-md px-3 py-2"
                      placeholder="18%"
                    />
                  </div>

                  <div className="col-span-2 border border-dashed rounded-lg p-10 text-center text-gray-500">
                    Upload PDF / JPG / PNG
                  </div>
                </div>
              )}
              {/* STEP 3 */}
              {step === 3 && (
                <div className="grid grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <motion.label
                      key={feature}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input type="checkbox" />
                      {feature}
                    </motion.label>
                  ))}
                </div>
              )}
              {/* STEP 4 */}
              {step === 4 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2,
                  }}
                >
                  <div className="max-w-xl mx-auto border rounded-xl p-5">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white p-5">
                      <h3 className="text-2xl font-bold">Premium Plus</h3>

                      <p className="mt-3 text-4xl font-bold">
                        $344
                        <span className="text-base font-normal"> / month</span>
                      </p>

                      <span className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-xs">
                        Billed Monthly
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {features.slice(0, 10).map((item) => (
                        <div key={item} className="text-sm">
                          ✅ {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Footer */}
        <div className="border-t p-3 flex justify-end gap-3">
          {step > 1 && (
            <button
              onClick={back}
              className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <motion.button
              onClick={next}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="bg-[#576CBC] text-white px-4 text-xs py-2 rounded-md"
            >
              Next
            </motion.button>
          ) : (
            <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-md hover:bg-[#4338CA]">
              Create Plan
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePlan;
