"use client";

import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function AddPackage({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    packageName: "",
    costPerHour: "",
    category: "",
    descriptionPoint: "",
    descriptionList: [""],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("AdminAuthToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      setError("Please login first. No authentication token found.");
    }
  }, []);

  // Add a new description list item
  const addDescriptionItem = () => {
    setFormData({
      ...formData,
      descriptionList: [...formData.descriptionList, ""],
    });
  };

  // Remove a description list item
  const removeDescriptionItem = (index: number) => {
    if (formData.descriptionList.length <= 1) return;

    const newList = [...formData.descriptionList];
    newList.splice(index, 1);
    setFormData({
      ...formData,
      descriptionList: newList,
    });
  };

  // Update a description list item
  const updateDescriptionItem = (index: number, value: string) => {
    const newList = [...formData.descriptionList];
    newList[index] = value;
    setFormData({
      ...formData,
      descriptionList: newList,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!token) {
      setError("Please login first. No authentication token found.");
      return;
    }

    setIsLoading(true);
    setError("");

    if (!formData.packageName.trim()) {
      setError("Package name is required");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        packageName: formData.packageName,
        costPerHour: formData.costPerHour || "0",
        categories: {
          Teacher: formData.category ? [formData.category] : [],
          Academics: [],
          PortalAcess: [],
          Scheduling: [],
          Dicount: []
        },
        descriptionPoint: formData.descriptionPoint,
        descriptionList: formData.descriptionList.filter(item => item.trim() !== ""),
        status: "Active",
        createdDate: new Date().toISOString(),
        createdBy: "admin",
        updatedDate: new Date().toISOString(),
        updatedBy: "admin",
      };

      console.log("Using token from login:", token.substring(0, 20) + "...");
      console.log("Payload being sent:", payload);

      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PACKAGAE.POST}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        setError("Session expired. Please login again.");
        // Clear expired token
        localStorage.removeItem("AdminAuthToken");
        setToken(null);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create package");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // If no token, show login required message
  if (!token) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Authentication Required
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Login Required
            </h4>
            <p className="text-gray-600 mb-6">
              You need to be logged in as an administrator to add packages.
            </p>
            <button
              onClick={() => {
                onClose();
                // Redirect to login page
                window.location.href = "/modules/users/admin-main/ui/sign-in";
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Add New Package
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Package Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Package Name *
              </label>
              <input
                type="text"
                value={formData.packageName}
                onChange={(e) =>
                  setFormData({ ...formData, packageName: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter package name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Cost per hour */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Per Hour
              </label>
              <input
                type="number"
                value={formData.costPerHour}
                onChange={(e) =>
                  setFormData({ ...formData, costPerHour: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category"
                disabled={isLoading}
              />
            </div>

            {/* Description Point */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description Point
              </label>
              <input
                type="text"
                value={formData.descriptionPoint}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descriptionPoint: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description point"
                disabled={isLoading}
              />
            </div>

            {/* Description List */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  Description List
                </label>
                <button
                  type="button"
                  onClick={addDescriptionItem}
                  className="text-blue-600 text-sm flex items-center disabled:text-gray-400"
                  disabled={isLoading}
                >
                  <Plus size={16} className="mr-1" /> Add Item
                </button>
              </div>

              <div className="space-y-2">
                {formData.descriptionList.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateDescriptionItem(index, e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder={`List item ${index + 1}`}
                      disabled={isLoading}
                    />
                    {formData.descriptionList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDescriptionItem(index)}
                        className="ml-2 text-red-500 hover:text-red-700 p-2 disabled:text-gray-400"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </span>
              ) : (
                "Save Package"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}