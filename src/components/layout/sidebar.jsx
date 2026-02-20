"use client";

import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

import {
    Bell,
    Building2,
    Calendar,
    ImageIcon,
    LayoutDashboard,
    Settings,
} from "lucide-react";

const menu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Institutes", icon: Building2, href: "/institute" },
    { name: "Plans", icon: ImageIcon, href: "/plans" },
    { name: "Notifications", icon: Bell, href: "/notifications" },
    { name: "Exam Countdown", icon: Calendar, href: "/examcountdown" },
    { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile }) {
    const { theme } = useTheme();

    const themeClasses = {
        dark: {
            sidebar: "bg-[#0D0D0D] text-white border-gray-800",
            hover: "hover:bg-gray-800",
            active: "bg-gray-800 text-white",
            icon: "text-gray-300 group-hover:text-white",
            overlay: "bg-black bg-opacity-60",
        },
        light: {
            sidebar: "bg-white text-black border-gray-200",
            hover: "hover:bg-gray-100",
            active: "bg-gray-200",
            icon: "text-gray-700 group-hover:text-black",
            overlay: "bg-black bg-opacity-30",
        },
    };

    const currentTheme = themeClasses[theme];

    const closeSidebar = () => {
        if (isMobile) setSidebarOpen(false);
    };

    const handleMenuClick = (href) => {
        if (isMobile) setSidebarOpen(false);
    };

    return (
        <>
            {/* FIXED OVERLAY BELOW NAVBAR */}
            {isMobile && sidebarOpen && (
                <div
                    className={`fixed top-16 left-0 right-0 bottom-0 z-40 ${currentTheme.overlay}`}
                    onClick={closeSidebar}
                />
            )}

            {/* SIDEBAR BOX */}
            <aside
                className={`
          fixed top-16 left-0
          h-[calc(100vh-4rem)] w-64 
          border-r z-50
          transition-transform duration-300
          ${currentTheme.sidebar}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
            >
                <div className="p-4 space-y-1 h-full overflow-y-auto">
                    {menu.map((item, i) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={() => handleMenuClick(item.href)}
                                className={`flex items-center gap-3 p-3 rounded-md group 
                  transition-all ${currentTheme.hover}`}
                            >
                                <Icon className={`w-5 h-5 ${currentTheme.icon}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
