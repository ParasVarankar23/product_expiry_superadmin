"use client";

import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ForgotPasswordPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const API = process.env.NEXT_PUBLIC_BACKEND_API;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [show, setShow] = useState({
        new: false,
        confirm: false,
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    /* ================= SEND OTP ================= */
    const sendOtp = async () => {
        try {
            setLoading(true);

            await axios.post(`${API}/superadmin/forgot-password`, {
                email: form.email,
            });

            toast.success("OTP sent to your email 📩");
            setStep(2);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= RESET PASSWORD ================= */
    const resetPassword = async () => {
        if (!form.otp) return toast.error("OTP is required");
        if (!form.newPassword) return toast.error("New password is required");
        if (form.newPassword !== form.confirmPassword)
            return toast.error("Passwords do not match");

        try {
            setLoading(true);

            await axios.post(`${API}/superadmin/verify-reset-otp`, {
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword,
            });

            toast.success("Password reset successfully 🔐");

            setForm({
                email: "",
                otp: "",
                newPassword: "",
                confirmPassword: "",
            });

            setStep(1);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Reset failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen flex transition-all duration-300
        ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
        >
            {/* ================= LEFT SIDE ================= */}
            <div
                className={`hidden md:flex w-1/2 flex-col justify-center px-20
          ${isDark ? "bg-zinc-950" : "bg-gray-100"}`}
            >
                <h1 className="text-4xl font-bold mb-6">
                    Secure Account Recovery
                </h1>

                <p className="opacity-70 leading-relaxed max-w-md">
                    Reset your SuperAdmin password securely using our
                    one-time password verification system. Your data
                    remains encrypted and protected at every step.
                </p>

                <div className="mt-10 space-y-4 text-sm opacity-80">
                    <div>✔ Secure OTP verification</div>
                    <div>✔ Instant password reset</div>
                    <div>✔ Encrypted authentication flow</div>
                    <div>✔ Enterprise-grade protection</div>
                </div>

                <div className="mt-12 text-xs opacity-50">
                    © 2026 SuperAdmin Panel. All rights reserved.
                </div>
            </div>

            {/* ================= RIGHT SIDE ================= */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-10">
                <div
                    className={`w-full max-w-md p-10 rounded-2xl border transition
            ${isDark
                            ? "bg-zinc-900 border-white/10"
                            : "bg-white border-gray-200 shadow-md"
                        }`}
                >
                    <h2 className="text-2xl font-semibold text-center mb-8">
                        Forgot Password
                    </h2>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm opacity-60">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your registered email"
                                    className={`w-full mt-2 px-4 py-3 rounded-xl border transition
                    ${isDark
                                            ? "bg-black border-white/20 text-white placeholder-gray-500"
                                            : "bg-white border-gray-300 placeholder-gray-400"
                                        }`}
                                />
                            </div>

                            <button
                                onClick={sendOtp}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-medium transition
                  ${isDark
                                        ? "bg-white text-black hover:opacity-80"
                                        : "bg-black text-white hover:opacity-80"
                                    }`}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm opacity-60">
                                    OTP Code
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={form.otp}
                                    onChange={handleChange}
                                    placeholder="Enter OTP sent to email"
                                    className={`w-full mt-2 px-4 py-3 rounded-xl border
                    ${isDark
                                            ? "bg-black border-white/20 text-white placeholder-gray-500"
                                            : "bg-white border-gray-300 placeholder-gray-400"
                                        }`}
                                />
                            </div>

                            <PasswordInput
                                label="New Password"
                                name="newPassword"
                                value={form.newPassword}
                                show={show.new}
                                toggle={() =>
                                    setShow({ ...show, new: !show.new })
                                }
                                onChange={handleChange}
                                isDark={isDark}
                                placeholder="Enter new password"
                            />

                            <PasswordInput
                                label="Confirm Password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                show={show.confirm}
                                toggle={() =>
                                    setShow({ ...show, confirm: !show.confirm })
                                }
                                onChange={handleChange}
                                isDark={isDark}
                                placeholder="Confirm new password"
                            />

                            <button
                                onClick={resetPassword}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-medium transition
                  ${isDark
                                        ? "bg-white text-black hover:opacity-80"
                                        : "bg-black text-white hover:opacity-80"
                                    }`}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ================= PASSWORD INPUT ================= */

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
                    className={`w-full px-4 py-3 rounded-xl border
            ${isDark
                            ? "bg-black border-white/20 text-white placeholder-gray-500"
                            : "bg-white border-gray-300 placeholder-gray-400"
                        }`}
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