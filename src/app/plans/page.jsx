"use client";

import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PlanPage() {

    const { theme } = useTheme();
    const isDark = theme === "dark";
    const router = useRouter();

    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [editData, setEditData] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, [search, planFilter, statusFilter, pagination.page]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(search && { search }),
                ...(planFilter && { plan: planFilter }),
                ...(statusFilter && { planStatus: statusFilter })
            });

            const res = await axiosInstance.get(`/superadmin/companies?${params}`);
            setCompanies(res.data.data);
            setPagination(prev => ({ ...prev, ...res.data.pagination }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch companies");
            toast.error(err.response?.data?.message || "Failed to fetch companies");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (company) => {
        setSelectedCompany(company);
        setEditData({
            companyName: company.companyName || '',
            ownerName: company.ownerName || '',
            ownerEmail: company.ownerEmail || '',
            plan: company.plan || 'free',
            userLimit: company.userLimit || 50,
            planStatus: company.planStatus || 'pending',
            isActive: company.isActive !== undefined ? company.isActive : true
        });
    };

    const closeModal = () => {
        setSelectedCompany(null);
        setEditData(null);
        setActionLoading(false);
    };

    const saveChanges = async () => {
        try {
            setActionLoading(true);

            // Update company details (name, owner info)
            const detailsPayload = {
                companyName: editData.companyName,
                ownerName: editData.ownerName,
                ownerEmail: editData.ownerEmail
            };

            await axiosInstance.put(
                `/superadmin/company/${selectedCompany._id}/details`,
                detailsPayload
            );

            // Update plan settings
            const planPayload = {
                plan: editData.plan,
                userLimit: parseInt(editData.userLimit),
                planStatus: editData.planStatus,
                isActive: editData.isActive
            };

            await axiosInstance.put(
                `/superadmin/company/${selectedCompany._id}/plan`,
                planPayload
            );

            toast.success("Company updated successfully");
            closeModal();
            fetchCompanies();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update company");
        } finally {
            setActionLoading(false);
        }
    };

    const changeStatus = async (type) => {
        try {
            setActionLoading(true);
            await axiosInstance.post(
                `/superadmin/company/${selectedCompany._id}/${type}`
            );
            toast.success(`Company ${type}d successfully`);
            closeModal();
            fetchCompanies();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${type} company`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuickDelete = async (company) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${company.companyName}"?\n\nThis will permanently delete:\n- The company and all its data\n- All users associated with this company\n- All products under this company\n\nThis action cannot be undone!`
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);
            await axiosInstance.delete(
                `/superadmin/company/${company._id}`
            );
            toast.success("Company deleted successfully");
            fetchCompanies();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete company");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = `w-full p-3 rounded-lg border outline-none transition
        ${isDark
            ? "bg-black border-white/20 text-white"
            : "bg-white border-black/20 text-black"
        }`;

    return (
        <div className={`min-h-screen p-10 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                 <h1 className="text-3xl font-bold">
                    Company Plan Management
                </h1>
                <button
                    onClick={() => router.push("/company")}
                    className={`px-6 py-3 rounded-lg font-medium transition
                        ${isDark
                            ? "bg-white text-black hover:opacity-80"
                            : "bg-black text-white hover:opacity-80"
                        }`}
                >
                    Add Company
                </button>

            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                    placeholder="Search company..."
                    className={inputStyle}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className={inputStyle}
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                </select>

                <select
                    className={inputStyle}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* LOADING & ERROR */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                    <p className="mt-2 opacity-70">Loading companies...</p>
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-8 text-red-500">
                    <p>{error}</p>
                    <button
                        onClick={fetchCompanies}
                        className="mt-4 px-4 py-2 rounded-lg border border-red-500 hover:bg-red-500/10"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* TABLE */}
            {!loading && !error && (
                <div
                    className={`rounded-2xl overflow-hidden border shadow-sm
      ${isDark ? "border-white/10 bg-black" : "border-black/10 bg-white"}`}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead
                                className={`sticky top-0 z-10 backdrop-blur-md
            ${isDark ? "bg-black/80 border-b border-white/10" : "bg-white/80 border-b border-black/10"}`}
                            >
                                <tr className="text-left opacity-70">
                                    <th className="px-6 py-4 font-medium">Company</th>
                                    <th className="px-6 py-4 font-medium">Owner</th>
                                    <th className="px-6 py-4 text-center font-medium">Plan</th>
                                    <th className="px-6 py-4 text-center font-medium">Users</th>
                                    <th className="px-6 py-4 text-center font-medium">Status</th>
                                    <th className="px-6 py-4 text-center font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {companies.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-16 text-center opacity-60">
                                            No companies found
                                        </td>
                                    </tr>
                                ) : (
                                    companies.map((company) => (
                                        <tr
                                            key={company._id}
                                            className={`transition-all duration-200
                  ${isDark
                                                    ? "border-t border-white/5 hover:bg-white/5"
                                                    : "border-t border-black/5 hover:bg-black/5"
                                                }`}
                                        >
                                            {/* COMPANY */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {company.companyName}
                                                    </span>
                                                    <span className="text-xs opacity-60">
                                                        {company.companyCode}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* OWNER */}
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {company.ownerName}
                                                    </span>
                                                    <span className="text-xs opacity-60">
                                                        {company.ownerEmail}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* PLAN */}
                                            <td className="px-6 py-5 text-center">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide
                      ${company.plan === "premium"
                                                            ? "bg-white text-black"
                                                            : company.plan === "basic"
                                                                ? isDark
                                                                    ? "bg-white/20 text-white"
                                                                    : "bg-black/10 text-black"
                                                                : "opacity-60 border border-dashed border-current"
                                                        }`}
                                                >
                                                    {company.plan.toUpperCase()}
                                                </span>
                                            </td>

                                            {/* USERS */}
                                            <td className="px-6 py-5 text-center font-medium">
                                                <span>
                                                    {company.totalUsers || 0}
                                                </span>
                                                <span className="opacity-50">
                                                    {" / "}
                                                    {company.userLimit}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-5 text-center">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium
                      ${company.planStatus === "active"
                                                            ? "bg-green-500/15 text-green-500"
                                                            : company.planStatus === "pending"
                                                                ? "bg-yellow-500/15 text-yellow-500"
                                                                : company.planStatus === "suspended"
                                                                    ? "bg-red-500/15 text-red-500"
                                                                    : "bg-gray-500/15 text-gray-400"
                                                        }`}
                                                >
                                                    {company.planStatus}
                                                </span>
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => openModal(company)}
                                                        disabled={loading}
                                                        className={`px-4 py-2 text-xs font-medium rounded-lg transition
                        ${isDark
                                                                ? "border border-white/20 hover:bg-white/10"
                                                                : "border border-black/20 hover:bg-black/5"
                                                            }`}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleQuickDelete(company)}
                                                        disabled={loading}
                                                        className="px-4 py-2 text-xs font-medium rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PAGINATION */}
            {!loading && !error && companies.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="opacity-70">
                        Showing {companies.length} of {pagination.total} companies
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className={`px-4 py-2 rounded-lg border transition
                                ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                                ${isDark ? 'border-white/30 hover:bg-white/10' : 'border-black/30 hover:bg-black/5'}
                            `}
                        >
                            Previous
                        </button>
                        <div className="px-4 py-2">
                            Page {pagination.page} of {pagination.pages}
                        </div>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.pages}
                            className={`px-4 py-2 rounded-lg border transition
                                ${pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : ''}
                                ${isDark ? 'border-white/30 hover:bg-white/10' : 'border-black/30 hover:bg-black/5'}
                            `}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {selectedCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div
                        className={`w-full max-w-4xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto
        ${isDark
                                ? "bg-black border border-white/20 text-white"
                                : "bg-white border border-black/20 text-black"
                            }`}
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold">{selectedCompany.companyName}</h2>
                                <p className="text-sm opacity-70 mt-1">{selectedCompany.companyCode}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={actionLoading}
                                className={`p-2 rounded-lg transition
            ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}
            ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* COMPANY NAME */}
                            <div>
                                <label className="block text-sm opacity-70 mb-1">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.companyName}
                                    onChange={(e) =>
                                        setEditData({ ...editData, companyName: e.target.value })
                                    }
                                    disabled={actionLoading}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none
              ${isDark
                                            ? "bg-black border-white/20 text-white"
                                            : "bg-white border-black/20"
                                        }
              ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            </div>

                            {/* OWNER NAME */}
                            <div>
                                <label className="block text-sm opacity-70 mb-1">
                                    Owner Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.ownerName}
                                    onChange={(e) =>
                                        setEditData({ ...editData, ownerName: e.target.value })
                                    }
                                    disabled={actionLoading}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none
              ${isDark
                                            ? "bg-black border-white/20 text-white"
                                            : "bg-white border-black/20"
                                        }
              ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            </div>

                            {/* OWNER EMAIL */}
                            <div>
                                <label className="block text-sm opacity-70 mb-1">
                                    Owner Email
                                </label>
                                <input
                                    type="email"
                                    value={editData.ownerEmail}
                                    onChange={(e) =>
                                        setEditData({ ...editData, ownerEmail: e.target.value })
                                    }
                                    disabled={actionLoading}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none
              ${isDark
                                            ? "bg-black border-white/20 text-white"
                                            : "bg-white border-black/20"
                                        }
              ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            </div>

                            {/* PLAN */}
                            <div>
                                <label className="block text-sm opacity-70 mb-1">
                                    Subscription Plan
                                </label>
                                <select
                                    value={editData.plan}
                                    onChange={(e) =>
                                        setEditData({ ...editData, plan: e.target.value })
                                    }
                                    disabled={actionLoading}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none
              ${isDark
                                            ? "bg-black border-white/20 text-white"
                                            : "bg-white border-black/20"
                                        }
              ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <option value="free">Free (50 users)</option>
                                    <option value="basic">Basic (250 users)</option>
                                    <option value="premium">Premium (10,000 users)</option>
                                </select>
                            </div>

                            {/* USER LIMIT */}
                            <div>
                                <label className="block text-sm opacity-70 mb-1">
                                    User Limit
                                </label>
                                <input
                                    type="number"
                                    value={editData.userLimit}
                                    onChange={(e) =>
                                        setEditData({ ...editData, userLimit: e.target.value })
                                    }
                                    disabled={actionLoading}
                                    min="1"
                                    className={`w-full px-4 py-3 rounded-xl border outline-none
              ${isDark
                                            ? "bg-black border-white/20 text-white"
                                            : "bg-white border-black/20"
                                        }
              ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                                <p className="text-xs opacity-60 mt-1">
                                    Current users: {selectedCompany.totalUsers || 0}
                                </p>
                            </div>

                            {/* STATUS */}
                            <div>
                                <label className="block text-sm opacity-70 mb-1">
                                    Plan Status
                                </label>
                                <select
                                    value={editData.planStatus}
                                    onChange={(e) =>
                                        setEditData({ ...editData, planStatus: e.target.value })
                                    }
                                    disabled={actionLoading}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none
              ${isDark
                                            ? "bg-black border-white/20 text-white"
                                            : "bg-white border-black/20"
                                        }
              ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* IS ACTIVE - Full Width */}
                            <div className="md:col-span-2 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editData.isActive === true}
                                    onChange={(e) =>
                                        setEditData({ ...editData, isActive: e.target.checked })
                                    }
                                    disabled={actionLoading}
                                    className="w-5 h-5 rounded"
                                />
                                <label htmlFor="isActive" className="text-sm">
                                    Company is active
                                </label>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="space-y-4 mt-8">
                            {/* STATUS ACTIONS */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => changeStatus("suspend")}
                                    disabled={actionLoading || selectedCompany.planStatus === "suspended"}
                                    className={`px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition
                                        ${actionLoading || selectedCompany.planStatus === "suspended" ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                >
                                    Suspend
                                </button>

                                <button
                                    onClick={() => changeStatus("deactivate")}
                                    disabled={actionLoading || selectedCompany.planStatus === "inactive"}
                                    className={`px-4 py-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 transition
                                        ${actionLoading || selectedCompany.planStatus === "inactive" ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                >
                                    Deactivate
                                </button>

                                <button
                                    onClick={() => changeStatus("activate")}
                                    disabled={actionLoading || selectedCompany.planStatus === "active"}
                                    className={`px-4 py-2 rounded-lg border border-green-500 text-green-500 hover:bg-green-500/10 transition
                                        ${actionLoading || selectedCompany.planStatus === "active" ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                >
                                    Activate
                                </button>
                            </div>

                            {/* SAVE AND CANCEL BUTTONS */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                    className={`px-6 py-2 rounded-xl font-medium border transition
                ${isDark
                                            ? "border-white/30 hover:bg-white/10"
                                            : "border-black/30 hover:bg-black/10"
                                        }
                ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveChanges}
                                    disabled={actionLoading}
                                    className={`px-6 py-2 rounded-xl font-medium transition
                ${isDark
                                            ? "bg-white text-black hover:opacity-80"
                                            : "bg-black text-white hover:opacity-80"
                                        }
                ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {actionLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}