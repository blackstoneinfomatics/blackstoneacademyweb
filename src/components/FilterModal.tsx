"use client"
import React from 'react';
import { X, Calendar } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date-range';
  options?: FilterOption[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, any>) => void;
  onReset: () => void;
  filterFields: FilterField[];
  filterValues: Record<string, any>;
  setFilterValues: (values: Record<string, any>) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onFilter,
  onReset,
  filterFields,
  filterValues,
  setFilterValues,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterValues({ ...filterValues, [name]: value });
  };

  const handleDateRangeChange = (name: string, part: 'from' | 'to', value: string) => {
    setFilterValues({
      ...filterValues,
      [name]: {
        ...filterValues[name],
        [part]: value,
      },
    });
  };

  const handleFilterClick = () => {
    onFilter(filterValues);
    onClose();
  };

  const handleResetClick = () => {
    onReset();
    setFilterValues({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-[#212121] p-6 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {filterFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              {field.type === 'text' && (
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.label}
                  value={filterValues[field.name] || ''}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                />
              )}
              {field.type === 'select' && (
                <select
                  name={field.name}
                  value={filterValues[field.name] || ''}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'date-range' && (
                <div className="flex gap-4">
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => (e.target.type = 'text')}
                      placeholder="Jan 20, 2020"
                      name={`${field.name}-from`}
                      value={filterValues[field.name]?.from || ''}
                      onChange={(e) => handleDateRangeChange(field.name, 'from', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-400"
                    />
                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                       <Calendar className="h-5 w-5 text-gray-400" />
                     </div>
                  </div>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => (e.target.type = 'text')}
                      placeholder="Jan 24, 2020"
                      name={`${field.name}-to`}
                      value={filterValues[field.name]?.to || ''}
                      onChange={(e) => handleDateRangeChange(field.name, 'to', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                       <Calendar className="h-5 w-5 text-gray-400" />
                     </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleResetClick}
            className="px-6 py-2 bg-transparent border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Reset
          </button>
          <button
            onClick={handleFilterClick}
            className="px-6 py-2 bg-[#576CBC] hover:bg-[#4A5A9A] text-white rounded-md"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal; 