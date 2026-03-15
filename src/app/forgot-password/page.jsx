"use client";

import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const API = process.env.NEXT_PUBLIC_BACKEND_API;
    const router = useRouter();

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
            router.push("/");
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
            <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">
                <div
                    className={`w-full max-w-md p-8 rounded-3xl border shadow-lg ${isDark
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-black/10"
                        }`}
                >
                    <h2 className="text-3xl font-bold text-center mb-1">
                        Forgot Password
                    </h2>
                    <p className="text-center opacity-70 mb-4">
                        Enter your credentials
                    </p>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendOtp();
                            }}
                        >
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your registered email"
                                required
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 ${isDark
                                    ? "bg-black border-white/20"
                                    : "bg-white border-black/20"
                                    }`}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-semibold transition ${isDark
                                    ? "bg-white text-black hover:opacity-90"
                                    : "bg-black text-white hover:opacity-90"
                                    }`}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                resetPassword();
                            }}
                        >
                            <input
                                type="text"
                                name="otp"
                                value={form.otp}
                                onChange={handleChange}
                                placeholder="Enter OTP sent to email"
                                required
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 ${isDark
                                    ? "bg-black border-white/20"
                                    : "bg-white border-black/20"
                                    }`}
                            />
                            <div className="relative">
                                <input
                                    type={show.new ? "text" : "password"}
                                    name="newPassword"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    required
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 ${isDark
                                        ? "bg-black border-white/20"
                                        : "bg-white border-black/20"
                                        }`}
                                />
                                <span
                                    onClick={() => setShow({ ...show, new: !show.new })}
                                    className="absolute right-4 top-3 cursor-pointer text-gray-400"
                                >
                                    {show.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type={show.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    required
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 ${isDark
                                        ? "bg-black border-white/20"
                                        : "bg-white border-black/20"
                                        }`}
                                />
                                <span
                                    onClick={() => setShow({ ...show, confirm: !show.confirm })}
                                    className="absolute right-4 top-3 cursor-pointer text-gray-400"
                                >
                                    {show.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-semibold transition ${isDark
                                    ? "bg-white text-black hover:opacity-90"
                                    : "bg-black text-white hover:opacity-90"
                                    }`}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
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
            <label htmlFor={name} className="text-sm opacity-60">
                {label}
            </label>

            <div className="relative mt-2">
                <input
                    id={name}
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

                <button
                    type="button"
                    onClick={toggle}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-4 top-3 opacity-60"
                >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
}