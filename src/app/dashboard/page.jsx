"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Building2, Calendar, CheckCircle, Users } from "lucide-react";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stats = [
    { label: "Total Companies", value: "0", icon: Building2, color: "bg-blue-500" },
    { label: "Active Plans", value: "0", icon: CheckCircle, color: "bg-green-500" },
    { label: "Total Users", value: "0", icon: Users, color: "bg-purple-500" },
    { label: "Expiring Soon", value: "0", icon: Calendar, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`p-6 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
        }`}>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.name || "SuperAdmin"}! 👋
        </h1>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                {stat.label}
              </h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
        }`}>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className={`p-4 rounded-lg border text-left transition ${isDark
              ? "border-white/20 hover:bg-white/10"
              : "border-gray-200 hover:bg-gray-50"
            }`}>
            <Building2 className="w-6 h-6 mb-2" />
            <h3 className="font-semibold mb-1">Register Company</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Add a new company to the platform
            </p>
          </button>
          <button className={`p-4 rounded-lg border text-left transition ${isDark
              ? "border-white/20 hover:bg-white/10"
              : "border-gray-200 hover:bg-gray-50"
            }`}>
            <CheckCircle className="w-6 h-6 mb-2" />
            <h3 className="font-semibold mb-1">Manage Plans</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              View and manage subscription plans
            </p>
          </button>
          <button className={`p-4 rounded-lg border text-left transition ${isDark
              ? "border-white/20 hover:bg-white/10"
              : "border-gray-200 hover:bg-gray-50"
            }`}>
            <Users className="w-6 h-6 mb-2" />
            <h3 className="font-semibold mb-1">View Analytics</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Check platform statistics
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

