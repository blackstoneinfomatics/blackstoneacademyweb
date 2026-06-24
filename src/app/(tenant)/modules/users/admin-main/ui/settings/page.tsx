"use client";

import React, { useEffect, useState } from "react";
import { FaChevronDown, FaFilter } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import { MdTune } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

export interface TenantUser {
  _id: string;
  userName: string;
  email: string;
  password: string;
  role: string[];
  profileImage: string | null;
  status: string;
  createdBy: string;
  lastUpdatedBy: string;
  userId: string;
  lastLoginDate: string;
  createdDate: string;
  lastUpdatedDate: string;
  __v: number;
  gender: string;
  country?: string;
}

interface TenantUsersResponse {
  users: TenantUser[];
  totalCount: number;
}

const Page: React.FC = () => {
  const [employees, setEmployees] = useState<TenantUser[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<TenantUser[]>([]);
  const [selectedRole, setSelectedRole] = useState("Academic Coach");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  const router = useRouter();
  const itemsPerPage = 10;

  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    name: "",
    designation: "",
    fromDate: "",
    toDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AdminAuthToken");
      if (token) {
        fetchTenantUsers(token);
      } else {
        toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchTenantUsers = async (token: string) => {
    try {
      const res = await axios.get<TenantUsersResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmployees(res.data.users);
      setFilteredEmployees(res.data.users);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching tenant users:", error);
      setError("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = employees.filter((emp) => {
      const createdDateFormatted = new Date(emp.createdDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      return (
        emp.userName.toLowerCase().includes(query.toLowerCase()) ||
        emp.email.toLowerCase().includes(query.toLowerCase()) ||
        emp.userId.toLowerCase().includes(query.toLowerCase()) ||
        emp.role
          .map((role) => role.toLowerCase())
          .some((role) => role.includes(query.toLowerCase())) ||
        createdDateFormatted.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  
  

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filtered = employees.filter((emp) => {
      const empDate = new Date(emp.createdDate);
      const fromDateMatch = filterCriteria.fromDate
        ? empDate >= new Date(filterCriteria.fromDate)
        : true;
      const toDateMatch = filterCriteria.toDate
        ? empDate <= new Date(filterCriteria.toDate)
        : true;

      return (
        (filterCriteria.name
          ? emp.userName
              .toLowerCase()
              .includes(filterCriteria.name.toLowerCase())
          : true) &&
        (filterCriteria.designation
          ? emp.role.includes(filterCriteria.designation)
          : true) &&
        fromDateMatch &&
        toDateMatch
      );
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1);
    setFilterPopupOpen(false);
  };

  const resetFilters = () => {
    setFilterCriteria({
      name: "",
      designation: "",
      fromDate: "",
      toDate: "",
    });
    setFilteredEmployees(employees);
    setCurrentPage(1);
  };

  const handleChanges = (empId: string, role: string[]) => {
    let path = "";
    console.log(role[0]);
    switch (role[0]) {
      case "ACADEMICCOACH":
        path = `/modules/users/admin-main/ui/settings/academic-coach?employeeId=${empId}`;
        break;
      case "STUDENT":
        path = `/modules/users/admin-main/ui/settings/student?employeeId=${empId}`;
        break;
      case "TEACHER":
        path = `/modules/users/admin-main/ui/settings/teacher?employeeId=${empId}`;
        break;
      case "SUPERVISOR":
        path = `/modules/users/admin-main/ui/settings/supervisor?employeeId=${empId}`;
        break;
      case "ADMIN":
        path = `/modules/users/admin-main/ui/settings/admin?employeeId=${empId}`;
        break;
      default:
        path = "/";
        break;
    }
    router.push(path);
  };

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Role Access" />
        <div className="mt-0">
          <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-t-lg flex justify-between items-center px-4 py-0">
            <div className="flex justify-between items-center px-4 py-0">
              <Search className="w-3 h-3 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search by keyword"
                className="bg-transparent outline-none text-[12px] ml-1 w-52 py-3"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div
              className="flex items-center gap-2 text-[12px] text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
              onClick={() => setFilterPopupOpen(true)}
            >
              <MdTune className="w-4 h-4" />
              <span>Filter</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-400">
              <span className="text-left -ml-60">
                Showing {currentItems.length} of {filteredEmployees.length}  
              </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434]">
        <table className="w-full table-auto">
          <thead className="text-[12px] bg-[#4C6993] text-white">
              <tr>
                <th className="px-3 py-4 text-left break-words w-[14%]">Employee ID</th>
                <th className="px-3 py-4 text-left">Employee Name</th>
                <th className="px-3 py-4 text-left break-words w-[14%]">Contact</th>
                <th className="px-3 py-4 text-left">Designation</th>
                <th className="px-3 py-4 text-left">Date of Joining</th>
                <th className="px-3 py-4 text-left">Role Access</th>
                <th className="px-3 py-4 text-left">Module Access</th>
              </tr>
            </thead>
            <tbody>
            {currentItems.map((emp, index) => (
                <tr
                  key={emp._id}
                  className="text-[11px] odd:bg-white even:bg-[#F8F8F8] dark:odd:bg-[#2C2C2C] dark:even:bg-[#303030]"
                >
                  <td className="px-2 py-5 text-left text-[#17243E] break-words w-[14%] max-w-[120px] dark:text-[#FDFDFD]">
                    {emp.userId}
                  </td>
                  <td className="px-2 py-5 text-left text-[#17243E] dark:text-[#FDFDFD] w-[10%]">
                    {emp.userName}
                  </td>
                  <td className="py-5 px-2 text-left break-words w-[14%] max-w-[120px] text-[#17243E] dark:text-[#FDFDFD]">
                    {emp.email}
                  </td>
                  <td className="py-5 px-2 text-left text-[#17243E] break-words dark:text-[#FDFDFD] w-[10%]">
                    {emp.role}
                  </td>
                  <td className="py-5 px-2 text-left  text-[#17243E] dark:text-[#FDFDFD] w-[10%]">
                    {new Date(emp.createdDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-2 text-left text-[#17243E] dark:text-[#FDFDFD] w-[10%]">
                    {emp.role}
                  </td>
                  <td className="py-1 px-2 w-[10%] text-left">
                    <button
                      className="w-full py-[6px] px-[2px] rounded-md bg-[#576CBC] text-[#fff] text-[9px]"
                      onClick={() => handleChanges(emp._id, emp.role)}
                    >
                      {emp.role}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
  currentPage={currentPage}
  totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
  onPageChange={setCurrentPage}
/>
      {/* </div> */}

      {/* Filter popup remains unchanged */}
      {isFilterPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filter</h2>
              <button
                onClick={() => setFilterPopupOpen(false)}
                className="text-gray-500 text-xl focus:outline-none"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="employeename" className="text-sm text-gray-700">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={filterCriteria.name}
                  onChange={handleFilterChange}
                  placeholder="Enter name"
                  className="w-full mt-1 rounded-lg border px-4 py-2 text-sm text-gray-700 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="designation" className="text-sm text-gray-700">
                  Designation
                </label>
                <select
                  name="designation"
                  value={filterCriteria.designation}
                  onChange={handleFilterChange}
                  className="w-full mt-1 rounded-lg border px-4 py-2 text-xs text-gray-700 bg-white focus:outline-none"
                >
                  <option value="">Select designation</option>
                  <option value="ACADEMICCOACH">ACADEMIC COACH</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label htmlFor="fromdate" className="text-sm text-gray-700">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={filterCriteria.fromDate}
                  onChange={handleFilterChange}
                  className="w-full mt-1 rounded-lg border px-4 py-2 text-xs text-gray-700 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="todate" className="text-sm text-gray-700">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={filterCriteria.toDate}
                  onChange={handleFilterChange}
                  className="w-full mt-1 rounded-lg border px-4 py-2 text-xs text-gray-700 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={applyFilters}
                className="bg-[#012A4A] text-white px-3 py-1 text-xs font-medium rounded-md"
              >
                Show  Results
              </button>
              <button
                onClick={resetFilters}
                className="border border-gray-300 px-3 py-1 text-xs font-medium rounded-md text-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout4>
  );
};

export default Page;
