"use client";

import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ForgotPasswordPage() {
    const { mode } = useTheme();

    const themeStyles = {
        light: {
            card: "bg-white text-gray-900 shadow-xl",
            input: "bg-gray-100 border border-gray-300 text-gray-800",
            label: "text-gray-700",
        },
        dark: {
            card: "bg-slate-900 text-gray-100 shadow-xl border border-slate-700",
            input: "bg-slate-800 border border-slate-600 text-gray-100",
            label: "text-gray-300",
        },
    };

    const T = themeStyles[mode] || themeStyles.light;
    const API = process.env.NEXT_PUBLIC_BACKEND_API;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /* ======================
       STEP 1 - SEND OTP
    ====================== */
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

    /* ======================
       STEP 2 - VERIFY OTP & RESET PASSWORD
    ====================== */
    const resetPassword = async () => {
        if (!form.otp) {
            toast.error("OTP is required");
            return;
        }
        if (!form.newPassword) {
            toast.error("New password is required");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await axios.post(`${API}/superadmin/verify-reset-otp`, {
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword,
            });

            toast.success("Password reset successfully 🔐");
            // Reset form and go back to step 1
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">

            <div className={`w-full max-w-md p-8 rounded-2xl ${T.card}`}>

                <h2 className="text-2xl font-bold text-center mb-6">
                    Forgot Password
                </h2>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-4">
                        <label className={T.label}>Enter Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className={`w-full p-3 rounded ${T.input}`}
                        />

                        <button
                            onClick={sendOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </div>
                )}

                {/* STEP 2 - OTP & RESET PASSWORD */}
                {step === 2 && (
                    <div className="space-y-4">
                        <label className={T.label}>Enter OTP</label>
                        <input
                            type="text"
                            name="otp"
                            value={form.otp}
                            onChange={handleChange}
                            placeholder="Enter OTP sent to your email"
                            required
                            className={`w-full p-3 rounded ${T.input}`}
                        />

                        <label className={T.label}>New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                required
                                className={`w-full p-3 rounded ${T.input}`}
                            />
                            <span
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-3 cursor-pointer text-gray-400"
                            >
                                {showPassword ? (
                                    <FaEyeSlash />
                                ) : (
                                    <FaEye />
                                )}
                            </span>
                        </div>

                        <label className={T.label}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            required
                            className={`w-full p-3 rounded ${T.input}`}
                        />

                        <button
                            onClick={resetPassword}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading
                                ? "Resetting..."
                                : "Reset Password"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}