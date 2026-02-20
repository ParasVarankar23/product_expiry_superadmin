"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

export default function ChangePasswordCard() {
    const { mode } = useTheme();

    const themeStyles = {
        light: {
            card: "bg-white text-gray-900 shadow-xl",
            label: "text-gray-700",
            input: "bg-gray-100 border border-gray-300 text-gray-800",
        },
        dark: {
            card: "bg-slate-900 text-gray-100 shadow-xl border border-slate-700",
            label: "text-gray-300",
            input: "bg-slate-800 border border-slate-600 text-gray-100",
        },
    };

    const T = themeStyles[mode] || themeStyles.light;

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await toast.promise(
                axiosInstance.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_API}/superadmin/change-password`,
                    {
                        oldPassword: form.oldPassword,
                        newPassword: form.newPassword,
                    }
                ),
                {
                    loading: "Changing password...",
                    success: "Password changed successfully 🔐",
                    error: (err) =>
                        err.response?.data?.message ||
                        "Failed to change password",
                }
            );

            setForm({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`max-w-2xl mx-auto p-6 rounded-2xl ${T.card}`}>
            <div className="flex items-center gap-3 mb-6">
                <FaLock className="text-blue-600 text-xl" />
                <h2 className="text-2xl font-bold">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* OLD PASSWORD */}
                <div>
                    <label className={T.label}>Old Password</label>
                    <div className="relative mt-1">
                        <input
                            type={showOld ? "text" : "password"}
                            name="oldPassword"
                            value={form.oldPassword}
                            onChange={handleChange}
                            required
                            className={`w-full p-3 rounded ${T.input}`}
                        />
                        <span
                            onClick={() => setShowOld(!showOld)}
                            className="absolute right-4 top-3 cursor-pointer text-gray-400"
                        >
                            {showOld ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* NEW PASSWORD */}
                <div>
                    <label className={T.label}>New Password</label>
                    <div className="relative mt-1">
                        <input
                            type={showNew ? "text" : "password"}
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                            className={`w-full p-3 rounded ${T.input}`}
                        />
                        <span
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-4 top-3 cursor-pointer text-gray-400"
                        >
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                    <label className={T.label}>Confirm New Password</label>
                    <div className="relative mt-1">
                        <input
                            type={showConfirm ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className={`w-full p-3 rounded ${T.input}`}
                        />
                        <span
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-3 cursor-pointer text-gray-400"
                        >
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}