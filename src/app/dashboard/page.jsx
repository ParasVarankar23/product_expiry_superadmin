"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [year]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/superadmin/dashboard-stats?year=${year}`
      );
      setStats(res.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center opacity-70">
        Loading dashboard...
      </div>
    );

  if (!stats)
    return (
      <div className="p-10 text-center opacity-70">
        No data available
      </div>
    );

  const planData = [
    { name: "Free", value: stats.companies.byPlan.free },
    { name: "Basic", value: stats.companies.byPlan.basic },
    { name: "Premium", value: stats.companies.byPlan.premium }
  ];

  const userRoleData = [
    { name: "Admin", value: stats.users.byRole.admin },
    { name: "Manager", value: stats.users.byRole.manager },
    { name: "Employee", value: stats.users.byRole.employee }
  ];

  const pieColors = isDark
    ? ["#ffffff", "#9ca3af", "#6b7280"]
    : ["#000000", "#4b5563", "#9ca3af"];

  return (
    <div
      className={`min-h-screen p-10 space-y-10 transition-all
        ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          SuperAdmin Dashboard
        </h1>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={`px-4 py-2 rounded-lg border outline-none
            ${isDark
              ? "bg-black border-white/20 text-white"
              : "bg-white border-black/20"
            }`}
        >
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
        </select>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Companies"
          value={stats.companies.total}
          isDark={isDark}
        />
        <StatCard
          title="Active Companies"
          value={stats.companies.active}
          isDark={isDark}
        />
        <StatCard
          title="Suspended"
          value={stats.companies.suspended}
          isDark={isDark}
        />
        <StatCard
          title="Total Users"
          value={stats.users.total}
          isDark={isDark}
        />
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* PIE CHART */}
        <div
          className={`rounded-2xl p-6 border shadow-sm
            ${isDark
              ? "border-white/10 bg-black"
              : "border-black/10 bg-white"
            }`}
        >
          <h2 className="text-lg font-semibold mb-6">
            Companies by Plan
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planData}
                dataKey="value"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={4}
              >
                {planData.map((entry, index) => (
                  <Cell key={index} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div
          className={`rounded-2xl p-6 border shadow-sm
            ${isDark
              ? "border-white/10 bg-black"
              : "border-black/10 bg-white"
            }`}
        >
          <h2 className="text-lg font-semibold mb-6">
            Users by Role
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userRoleData}>
              <CartesianGrid
                stroke={isDark ? "#222" : "#eee"}
                strokeDasharray="3 3"
              />
              <XAxis dataKey="name" stroke={isDark ? "#aaa" : "#444"} />
              <YAxis stroke={isDark ? "#aaa" : "#444"} />
              <Tooltip />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill={isDark ? "#ffffff" : "#000000"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, isDark }) {
  return (
    <div
      className={`rounded-2xl p-6 border transition-all
        ${isDark
          ? "border-white/10 bg-black hover:bg-white/5"
          : "border-black/10 bg-white hover:bg-black/5"
        }`}
    >
      <p className="text-sm opacity-60">{title}</p>
      <p className="text-3xl font-semibold mt-3">{value}</p>
    </div>
  );
}