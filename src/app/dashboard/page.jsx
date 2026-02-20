"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function DashboardPage() {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [year]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(
        `/superadmin/dashboard-stats?year=${year}`
      );

      setStats(res.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-600">Error: {error}</p>;
  if (!stats) return <p className="p-6 text-center">No data available</p>;

  const planData = [
    { name: "Free", value: stats.companies.byPlan.free },
    { name: "Basic", value: stats.companies.byPlan.basic },
    { name: "Premium", value: stats.companies.byPlan.premium }
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="p-8 space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SuperAdmin Dashboard</h1>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded"
        >
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
        </select>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <Card title="Total Companies" value={stats.companies.total} />
        <Card title="Active Companies" value={stats.companies.active} />
        <Card title="Suspended" value={stats.companies.suspended} />
        <Card title="Total Users" value={stats.users.total} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-8">

        {/* PLAN PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Companies by Plan
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planData}
                dataKey="value"
                outerRadius={100}
              >
                {planData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* USER ROLE BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Users by Role
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Admin", value: stats.users.byRole.admin },
                { name: "Manager", value: stats.users.byRole.manager },
                { name: "Employee", value: stats.users.byRole.employee }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}