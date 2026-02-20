"use client";

import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyDetails() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            const res = await axiosInstance.get(`/superadmin/company/${id}`);
            setData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return <div className="p-10 text-center opacity-70">Loading...</div>;

    const used =
        data.userStats.total || 0;

    const limit =
        data.company.userLimit || 0;

    const percentage =
        limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

    return (
        <div
            className={`min-h-screen p-12 transition-all
        ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"}`}
        >
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold">
                    {data.company.companyName}
                </h1>
                <p className="opacity-60 mt-2">
                    Company Code: {data.company.companyCode}
                </p>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <InfoCard
                    label="Owner Name"
                    value={data.company.ownerName}
                    isDark={isDark}
                />

                <InfoCard
                    label="Owner Email"
                    value={data.company.ownerEmail}
                    isDark={isDark}
                />

                <PlanBadge
                    plan={data.company.plan}
                    isDark={isDark}
                />

                <InfoCard
                    label="User Limit"
                    value={limit}
                    isDark={isDark}
                />

                <StatusBadge
                    status={data.company.planStatus}
                    isDark={isDark}
                />

                {/* USERS USED WITH PROGRESS */}
                <div
                    className={`rounded-2xl p-6 border
            ${isDark ? "border-white/10 bg-zinc-900" : "border-gray-200 bg-white shadow-sm"}
          `}
                >
                    <p className="text-sm opacity-60">Users Used</p>
                    <p className="text-2xl font-semibold mt-2">
                        {used} / {limit}
                    </p>

                    <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full mt-4">
                        <div
                            style={{ width: `${percentage}%` }}
                            className="h-2 bg-black dark:bg-white rounded-full transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* USER STATISTICS SECTION */}
            <div
                className={`mt-12 rounded-2xl p-10 border
          ${isDark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200 shadow-sm"}
        `}
            >
                <h2 className="text-2xl font-semibold mb-8">
                    User Statistics
                </h2>

                <div className="grid grid-cols-2 gap-10 text-lg">
                    <div>
                        <p className="opacity-60">Total Users</p>
                        <p className="text-3xl font-bold mt-2">
                            {data.userStats.total}
                        </p>
                    </div>

                    <div>
                        <p className="opacity-60">Active Users</p>
                        <p className="text-3xl font-bold mt-2">
                            {data.userStats.active}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value, isDark }) {
    return (
        <div
            className={`rounded-2xl p-6 border transition-all
        ${isDark
                    ? "border-white/10 bg-zinc-900"
                    : "border-gray-200 bg-white shadow-sm"
                }
      `}
        >
            <p className="text-sm opacity-60">{label}</p>
            <p className="text-xl font-semibold mt-3 break-all overflow-hidden">{value}</p>
        </div>
    );
}

function PlanBadge({ plan, isDark }) {
    const colors = {
        free: "bg-gray-200 text-gray-800",
        basic: "bg-blue-100 text-blue-700",
        premium: "bg-purple-100 text-purple-700"
    };

    return (
        <div
            className={`rounded-2xl p-6 border
        ${isDark ? "border-white/10 bg-zinc-900" : "border-gray-200 bg-white shadow-sm"}
      `}
        >
            <p className="text-sm opacity-60">Plan</p>
            <span
                className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold capitalize
          ${colors[plan] || colors.free}
        `}
            >
                {plan}
            </span>
        </div>
    );
}

function StatusBadge({ status, isDark }) {
    const colors = {
        active: "bg-green-100 text-green-700",
        suspended: "bg-red-100 text-red-700",
        inactive: "bg-gray-200 text-gray-800",
        pending: "bg-yellow-100 text-yellow-700"
    };

    return (
        <div
            className={`rounded-2xl p-6 border
        ${isDark ? "border-white/10 bg-zinc-900" : "border-gray-200 bg-white shadow-sm"}
      `}
        >
            <p className="text-sm opacity-60">Plan Status</p>
            <span
                className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold capitalize
          ${colors[status] || colors.inactive}
        `}
            >
                {status}
            </span>
        </div>
    );
}