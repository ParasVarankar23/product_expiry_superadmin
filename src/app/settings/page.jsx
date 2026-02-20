"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

export default function ChangePasswordCard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleCancel = () => {
        setForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
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
                axiosInstance.post(`/superadmin/change-password`, {
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword,
                }),
                {
                    loading: "Updating password...",
                    success: "Password updated successfully 🔐",
                    error: (err) =>
                        err.response?.data?.message || "Failed to update password",
                }
            );

            handleCancel();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center p-10
        ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"}`}
        >
            <div
                className={`w-full max-w-xl rounded-2xl p-10 border transition-all
          ${isDark
                        ? "bg-zinc-900 border-white/10"
                        : "bg-white border-gray-200 shadow-sm"
                    }`}
            >
                {/* HEADER */}
                <div className="flex items-center gap-3 mb-8">
                    <FaLock />
                    <h2 className="text-2xl font-semibold">
                        Change Password
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <PasswordInput
                        label="Old Password"
                        name="oldPassword"
                        placeholder="Enter your old password"
                        value={form.oldPassword}
                        show={show.old}
                        toggle={() => setShow({ ...show, old: !show.old })}
                        onChange={handleChange}
                        isDark={isDark}
                    />

                    <PasswordInput
                        label="New Password"
                        name="newPassword"
                        placeholder="Enter your new password"
                        value={form.newPassword}
                        show={show.new}
                        toggle={() => setShow({ ...show, new: !show.new })}
                        onChange={handleChange}
                        isDark={isDark}
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        placeholder="Confirm your new password"
                        value={form.confirmPassword}
                        show={show.confirm}
                        toggle={() => setShow({ ...show, confirm: !show.confirm })}
                        onChange={handleChange}
                        isDark={isDark}
                    />

                    {/* BUTTON ROW */}
                    <div className="flex gap-4 pt-2">

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className={`flex-1 py-3 rounded-xl border transition
                ${isDark
                                    ? "border-white/20 hover:bg-white/10"
                                    : "border-gray-300 hover:bg-gray-100"
                                }
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 rounded-xl font-medium transition
                ${isDark
                                    ? "bg-white text-black hover:opacity-80"
                                    : "bg-black text-white hover:opacity-80"
                                }
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordInput({
    label,
    name,
    value,
    show,
    toggle,
    onChange,
    isDark,
    placeholder,
}) {
    return (
        <div>
            <label className="text-sm opacity-60">
                {label}
            </label>

            <div className="relative mt-2">
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition
            ${isDark
                            ? "bg-black border-white/20 text-white placeholder-gray-500 focus:border-white"
                            : "bg-white border-gray-300 placeholder-gray-400 focus:border-black"
                        }
          `}
                />

                <span
                    onClick={toggle}
                    className="absolute right-4 top-3 cursor-pointer opacity-60"
                >
                    {show ? <FaEyeSlash /> : <FaEye />}
                </span>
            </div>
        </div>
    );
}