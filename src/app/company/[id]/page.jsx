"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyDetails() {

    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axiosInstance.get(
                `/superadmin/company/${id}`
            );

            setData(res.data.data);
        } catch (err) {
            console.error("Error fetching company details:", err);
            setError(err.response?.data?.message || "Failed to load company details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="p-6 text-center">Loading...</p>;
    if (error) return <p className="p-6 text-center text-red-600">Error: {error}</p>;

    return (
        <div className="p-8 space-y-6">

            <h1 className="text-3xl font-bold">
                {data.company.companyName}
            </h1>

            <div className="grid grid-cols-3 gap-6">

                <Info label="Owner" value={data.company.ownerName} />
                <Info label="Email" value={data.company.ownerEmail} />
                <Info label="Plan" value={data.company.plan} />
                <Info label="User Limit" value={data.company.userLimit} />
                <Info label="Status" value={data.company.planStatus} />
                <Info label="Users Used" value={data.userStats.userLimitUsed} />

            </div>

            {/* USERS TABLE */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                    User Statistics
                </h2>

                <table className="w-full">
                    <thead>
                        <tr>
                            <th>Total Users</th>
                            <th>Active Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.userStats.total}</td>
                            <td>{data.userStats.active}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="bg-white shadow p-4 rounded-xl">
            <p className="text-gray-500">{label}</p>
            <p className="font-bold mt-1">{value}</p>
        </div>
    );
}