"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Moon, Search, Sun } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import { RiCloseLine, RiMenu3Line } from "react-icons/ri";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { profile, logout } = useAuth();
    const router = useRouter();

    const [openProfile, setOpenProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsType, setStatsType] = useState(null); // 'plan' | 'status' | 'register'
    const [statsData, setStatsData] = useState(null);
    const statsTimer = useRef(null);

    const profileRef = useRef(null);
    const searchRef = useRef(null);
    const statsRef = useRef(null);

    /* -----------------------------------------
       LOGOUT MODAL STATES
    ------------------------------------------ */
    const [logoutModal, setLogoutModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const countdownRef = useRef(null);

    // Get user name from AuthContext profile (NOT from token)
    const superName = profile?.name || "SuperAdmin";

    /* -----------------------------------------
       CLICK OUTSIDE CLOSE DROPDOWN
    ------------------------------------------ */
    useEffect(() => {
        const handler = (e) => {
            // Close profile dropdown when clicking outside profileRef
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setOpenProfile(false);
            }

            // Close stats/search dropdown when clicking outside search or stats containers
            const clickedInsideSearch = searchRef.current && searchRef.current.contains(e.target);
            const clickedInsideStats = statsRef.current && statsRef.current.contains(e.target);
            if (!clickedInsideSearch && !clickedInsideStats) {
                setShowStats(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setShowStats(false);
                setOpenProfile(false);
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* -----------------------------------------
       SEARCH
    ------------------------------------------ */
    const handleSearchSubmit = (e) => {
        if (e.key === "Enter") {
            router.push(`/search?query=${searchQuery}`);
        }
    };

    // Debounced watcher for contextual stats suggestions
    useEffect(() => {
        if (statsTimer.current) clearTimeout(statsTimer.current);

        if (!searchQuery || searchQuery.trim().length < 1) {
            setShowStats(false);
            setStatsData(null);
            setStatsType(null);
            return;
        }

        const q = searchQuery.trim().toLowerCase();

        statsTimer.current = setTimeout(async () => {
            try {
                setStatsLoading(true);

                // PLAN overview
                if (q.includes("plan") || q === "plans") {
                    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API;
                    const res = await axiosInstance.get(`${BACKEND}/institute/plans/overview`);
                    setStatsData(res.data.data || {});
                    setStatsType("plan");
                    setShowStats(true);
                    return;
                }

                // STATUS overview (active/suspend)
                if (q.includes("active") || q.includes("accept") || q.includes("suspend") || q.includes("suspended") || q === "status") {
                    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API;
                    const res = await axiosInstance.get(`${BACKEND}/institute/status/overview`);
                    setStatsData(res.data.data || {});
                    setStatsType("status");
                    setShowStats(true);
                    return;
                }

                // REGISTER quick action
                if (q.includes("register") || q.includes("sign up") || q.includes("signup")) {
                    setStatsType("register");
                    setStatsData(null);
                    setShowStats(true);
                    return;
                }

                // Otherwise show a 'no results' notice for unknown queries
                setShowStats(true);
                setStatsData(null);
                setStatsType("none");

            } catch (err) {
                console.error("Search stats error:", err);
                setShowStats(true);
                setStatsData(null);
                setStatsType("none");
            } finally {
                setStatsLoading(false);
            }
        }, 350);

        return () => {
            if (statsTimer.current) clearTimeout(statsTimer.current);
        };
    }, [searchQuery]);

    /* -----------------------------------------
       CONFIRM LOGOUT FUNCTION
    ------------------------------------------ */
    const confirmLogout = async () => {
        await logout();
        router.push("/");
    };

    /* -----------------------------------------
       OPEN MODAL + START COUNTDOWN
    ------------------------------------------ */
    const openLogoutModal = () => {
        setLogoutModal(true);
        setCountdown(5);

        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    confirmLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    /* -----------------------------------------
       THEME CLASSES
    ------------------------------------------ */
    const themeClasses = {
        dark: {
            nav: "bg-[#0D0D0D] text-white border-gray-800",
            dropdown: "bg-[#1a1a1a] border-gray-700 text-white",
            hover: "hover:bg-gray-800",
            icon: "hover:bg-gray-700",
            input: "bg-[#1a1a1a] text-white placeholder-gray-400 border border-gray-700",
            modalBg: "bg-[#1a1a1a] text-white"
        },
        light: {
            nav: "bg-white text-black border-gray-200",
            dropdown: "bg-white border-gray-200 text-black",
            hover: "hover:bg-gray-100",
            icon: "hover:bg-gray-200",
            input: "bg-gray-100 text-black placeholder-gray-500 border border-gray-300",
            modalBg: "bg-white text-black"
        }
    };

    const currentTheme = themeClasses[theme];

    return (
        <>
            {/* ======================= NAVBAR ======================= */}
            <nav className={`fixed w-full top-0 left-0 z-50 border-b ${currentTheme.nav}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* LEFT SIDE */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen((prev) => !prev)}
                                className={`p-2 rounded-md md:hidden ${currentTheme.icon}`}
                            >
                                {sidebarOpen ? <RiCloseLine size={22} /> : <RiMenu3Line size={22} />}
                            </button>

                            <span className="text-lg md:text-xl font-semibold">
                                Welcome, {superName}
                            </span>
                        </div>

                        {/* SEARCH BAR */}
                        <div ref={searchRef} className="hidden md:flex items-center w-1/3 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-70" />
                            <input
                                type="text"
                                placeholder="Search plans, active, suspend or register"
                                className={`w-full py-2 pl-10 pr-4 rounded-md outline-none ${currentTheme.input}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                            />
                            {/* Contextual stats dropdown */}
                            {showStats && (
                                <div ref={statsRef} className={`absolute left-0 top-full mt-2 w-full sm:w-[520px] z-50 p-3 rounded-md shadow-lg border ${currentTheme.dropdown}`} style={{ transform: 'translateY(6px)' }}>
                                    {statsLoading && <div className="text-sm">Loading...</div>}

                                    {!statsLoading && statsType === "plan" && statsData && (
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex-1 text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                                                <div className="text-xs">Free</div>
                                                <div className="text-lg font-bold">{statsData.free ?? 0}</div>
                                            </div>
                                            <div className="flex-1 text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                                                <div className="text-xs">Basic</div>
                                                <div className="text-lg font-bold">{statsData.basic ?? 0}</div>
                                            </div>
                                            <div className="flex-1 text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                                                <div className="text-xs">Pro</div>
                                                <div className="text-lg font-bold">{statsData.pro ?? 0}</div>
                                            </div>
                                            <div className="flex-1 text-center p-2 bg-gray-50 dark:bg-slate-800 rounded">
                                                <div className="text-xs">Custom</div>
                                                <div className="text-lg font-bold">{statsData.custom ?? 0}</div>
                                            </div>
                                        </div>
                                    )}

                                    {!statsLoading && statsType === "status" && statsData && (
                                        <div className="flex gap-3 justify-between">
                                            <div className="flex-1 text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                                                <div className="text-xs">Active</div>
                                                <div className="text-lg font-bold">{statsData.accepted ?? statsData.accept ?? 0}</div>
                                            </div>
                                            <div className="flex-1 text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                                                <div className="text-xs">Suspended</div>
                                                <div className="text-lg font-bold">{statsData.suspended ?? statsData.suspend ?? 0}</div>
                                            </div>
                                            <div className="flex-1 text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                <div className="text-xs">Total</div>
                                                <div className="text-lg font-bold">{statsData.total ?? 0}</div>
                                            </div>
                                        </div>
                                    )}

                                    {!statsLoading && statsType === "register" && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-medium">Register new institute</div>
                                                <div className="text-xs text-gray-500">Quick link to register an institute</div>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => router.push("/institute")}
                                                    className="px-3 py-2 bg-blue-600 text-white rounded"
                                                >
                                                    Register
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {!statsLoading && statsType === "none" && (
                                        <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-300">
                                            No quick results for "{searchQuery}". Try: <strong>plan</strong>, <strong>active</strong>, <strong>suspend</strong>, or <strong>register</strong>.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex items-center gap-4">

                            {/* THEME TOGGLE */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-md ${currentTheme.icon}`}
                            >
                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* PROFILE DROPDOWN */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setOpenProfile(!openProfile)}
                                    className={`p-2 rounded-md flex items-center gap-2 ${currentTheme.icon}`}
                                >
                                    <FaUserCircle size={20} />
                                    <span className="hidden md:inline">Profile</span>
                                </button>

                                {openProfile && (
                                    <div
                                        className={`absolute right-0 mt-2 w-44 rounded-lg shadow-md border z-50 ${currentTheme.dropdown}`}
                                    >
                                        <Link
                                            href="/profile"
                                            className={`block px-4 py-2 ${currentTheme.hover}`}
                                        >
                                            View Profile
                                        </Link>

                                        <button
                                            onClick={openLogoutModal}
                                            className={`w-full text-left block px-4 py-2 ${currentTheme.hover}`}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </nav>

            {/* ======================= LOGOUT MODAL ======================= */}
            {logoutModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-999 flex items-center justify-center animate-fadeIn">

                    <div
                        className={`p-6 rounded-xl shadow-xl w-full max-w-sm animate-scaleIn ${currentTheme.modalBg}`}
                    >
                        <h2 className="text-xl font-semibold text-center">
                            Logging out in{" "}
                            <span className="text-red-500 text-2xl">{countdown}</span> seconds
                        </h2>

                        <div className="flex justify-center my-5">
                            {/* Countdown Circle */}
                            <div className="w-20 h-20 rounded-full border-4 border-red-500 animate-pulse flex items-center justify-center text-red-500 text-2xl font-bold">
                                {countdown}
                            </div>
                        </div>

                        <p className="text-center opacity-80">Are you sure you want to logout?</p>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => {
                                    clearInterval(countdownRef.current);
                                    setLogoutModal(false);
                                }}
                                className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    clearInterval(countdownRef.current);
                                    confirmLogout();
                                }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                                Logout Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
