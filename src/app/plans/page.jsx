"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";

export default function PlanPage() {

    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, [search, planFilter]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axiosInstance.get(
                `/superadmin/companies?search=${search}&plan=${planFilter}`
            );

            setCompanies(res.data.data);
        } catch (err) {
            console.error("Error fetching companies:", err);
            setError(err.response?.data?.message || "Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    const updatePlan = async (companyId, plan) => {
        try {
            setError(null);

            await axiosInstance.put(
                `/superadmin/company/${companyId}/plan`,
                { plan }
            );

            fetchCompanies();
        } catch (err) {
            console.error("Error updating plan:", err);
            setError(err.response?.data?.message || "Failed to update plan");
        }
    };

    return (
        <div className="p-8">

            <h1 className="text-3xl font-bold mb-6">
                Company Plan Management
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* FILTER BAR */}
            <div className="flex gap-4 mb-6">
                <input
                    placeholder="Search company..."
                    className="border p-2 rounded w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={loading}
                />

                <select
                    className="border p-2 rounded"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    disabled={loading}
                >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                </select>
            </div>

            {loading && <p className="text-center py-4">Loading companies...</p>}

            {!loading && companies.length === 0 && (
                <p className="text-center py-4 text-gray-500">No companies found</p>
            )}

            {/* TABLE */}
            {!loading && companies.length > 0 && (
                <table className="w-full bg-white shadow rounded-xl">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Company</th>
                            <th>Plan</th>
                            <th>User Limit</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {companies.map(company => (
                            <tr key={company._id} className="border-t">
                                <td className="p-3">{company.companyName}</td>
                                <td>{company.plan}</td>
                                <td>{company.userLimit}</td>
                                <td>{company.planStatus}</td>
                                <td>
                                    <select
                                        value={company.plan}
                                        onChange={(e) =>
                                            updatePlan(company._id, e.target.value)
                                        }
                                        className="border p-1 rounded"
                                    >
                                        <option value="free">Free</option>
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}