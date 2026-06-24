import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages, appSuccessToastMessages } from "@/app/_components/contents/toast_message";

interface ExpenseFormData {
  paymentDate: string;
  expenseType: string;
  amount: number | string;
  category: string;
  paymentMethod: string;
  status: string;
}

interface ExpensePayload {
  paymentDate: string;
  expenseType: string;
  amount: string;
  category: string;
  paymentMethod: string;
  status: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  updatedBy: string;
}

interface AddExpensesProps {
  onClose: () => void;
  refreshExpenses?: () => void;
}

const AddExpenses: React.FC<AddExpensesProps> = ({ onClose, refreshExpenses }) => {
  const API_URL = `${AppApiEndpoints.API_END_POINT}`;

  const [formData, setFormData] = useState<ExpenseFormData>({
    paymentDate: "",
    expenseType: "",
    amount: "",
    category: "",
    paymentMethod: "Cash",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.paymentDate) {
      toast.error(AppValidationMessages.EXPENSE.PAYMENT_DATE_REQUIRED);
      return false;
    }

    if (!formData.expenseType.trim()) {
      toast.error(AppValidationMessages.EXPENSE.EXPENSE_TYPE_REQUIRED);
      return false;
    }

    if (!formData.amount) {
      toast.error(AppValidationMessages.EXPENSE.AMOUNT_REQUIRED);
      return false;
    }

    if (Number(formData.amount) <= 0) {
      toast.error(AppValidationMessages.EXPENSE.AMOUNT_POSITIVE);
      return false;
    }

    if (!formData.category) {
      toast.error(AppValidationMessages.EXPENSE.CATEGORY_REQUIRED);
      return false;
    }

    if (!formData.paymentMethod) {
      toast.error(AppValidationMessages.EXPENSE.PAYMENT_METHOD_REQUIRED);
      return false;
    }

    return true;
  };

  const formatPayload = (): ExpensePayload => {
    const now = new Date().toISOString();
    return {
      paymentDate: formData.paymentDate,
      expenseType: formData.expenseType.trim(),
      amount: Number(formData.amount).toFixed(2),
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      createdBy: "Admin",
      createdDate: now,
      updatedDate: now,
      updatedBy: "Admin"
    };
  };

  const handleAddPayment = async () => {
    try {
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitSuccess(false);

      const payload = formatPayload();
      console.log("Submitting payload:", payload);
 const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }      
      
      const response = await axios.post(
        `${API_URL}${AppApiEndpoints.EXPENSE.CREATE}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      console.log("Server response:", response.data);
      toast.success(appSuccessToastMessages.EXPENSE_RECORDED);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setFormData({
          paymentDate: "",
          expenseType: "",
          amount: "",
          category: "",
          paymentMethod: "Cash",
          status: "Active",
        });
        setSubmitSuccess(false);
        if (refreshExpenses) refreshExpenses();
      }, 1500);

    } catch (error: any) {
      console.error("Error details:", {
        error: error,
        response: error.response?.data,
        config: error.config,
      });

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.data.errors) {
            Object.entries(error.response.data.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach((message: string) => toast.error(`${field}: ${message}`));
              } else {
                toast.error(`${field}: ${messages}`);
              }
            });
            } else {
              toast.error(error.response.data.message || AppFailureToastMessages.BAD_REQUEST);
            }
          } else if (error.request) {
            toast.error(AppFailureToastMessages.NO_RESPONSE);
          } else {
            toast.error(AppFailureToastMessages.REQUEST_ERROR + error.message);
          }
      } else {
        toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto mx-auto p-6 rounded-lg shadow-md relative bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        style={{
          width: 'clamp(300px, 90vw, 800px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          [class*="dark:bg-gray-800"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100">
          Add Expense
        </h2>
        
        {submitSuccess ? (
          <div className="p-4 rounded-lg text-center mb-6 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100">
            <h3 className="font-bold text-lg">Expense Recorded Successfully!</h3>
          </div>
        ) : (
          <form className="space-y-5">
            <div>
              <label className="block font-medium mb-2 dark:text-gray-300">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-2 dark:text-gray-300">
                Expense Type
              </label>
              <input
                type="text"
                name="expenseType"
                value={formData.expenseType}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                required
                maxLength={100}
                placeholder="Enter expense description"
              />
            </div>

            <div>
              <label className="block font-medium mb-2 dark:text-gray-300">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white pl-4"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2 dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 dark:text-gray-300">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg font-medium text-[#576CBC] dark:text-blue-400 border-[#576CBC] dark:border-blue-400 border-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPayment}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-[#576CBC] dark:bg-blue-600 hover:bg-[#4758a8] dark:hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Add Payment"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddExpenses;