"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
    const { theme } = useTheme();
    const { login } = useAuth();
    const isDark = theme === "dark";
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ==============================
    // 🔐 NORMAL LOGIN
    // ==============================
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Use AuthContext login method
            await login(form.email, form.password);

            toast.success("Login Successful 🚀");

            router.push("/dashboard");

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className={`min-h-screen flex ${isDark ? "bg-black text-white" : "bg-white text-black"
                }`}
        >
            {/* LEFT SIDE */}
            {/* LEFT SIDE */}
            <div
                className={`hidden md:flex w-1/2 flex-col justify-center px-16 ${isDark ? "bg-white/5" : "bg-black/[0.03]"
                    }`}
            >
                <h1 className="text-5xl font-extrabold mb-5 leading-tight">
                    SuperAdmin Panel{" "}
                    <span className="text-sky-500">ProductExpiry</span>
                </h1>

                <p className="text-lg opacity-70 max-w-md leading-relaxed">
                    This panel allows you to register companies, manage
                    subscriptions, monitor plan activity, and control the
                    entire ProductExpiry platform.
                </p>

                <div className="mt-8 space-y-3 text-sm opacity-90">
                    <p className="font-semibold text-sky-500">
                        Available Subscription Plans:
                    </p>
                    <ul className="space-y-2">
                        <li>✔ <strong>Free Plan</strong> – Basic expiry tracking (1 year access)</li>
                        <li>✔ <strong>Basic Plan</strong> – Smart alerts + Dashboard</li>
                        <li>✔ <strong>Premium Plan</strong> – Full AI insights + Analytics</li>
                    </ul>
                </div>

                <div className="mt-8 text-sm opacity-70">
                    <p className="font-semibold mb-2">SuperAdmin Access Includes:</p>
                    <ul className="space-y-1">
                        <li>✔ Company Registration</li>
                        <li>✔ Plan Activation & Monitoring</li>
                        <li>✔ Payment Control</li>
                        <li>✔ Platform Analytics</li>
                    </ul>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">
                <div
                    className={`w-full max-w-md p-8 rounded-3xl border shadow-lg ${isDark
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-black/10"
                        }`}
                >
                    <h2 className="text-3xl font-bold text-center mb-1">
                        SuperAdmin Login
                    </h2>
                    <p className="text-center opacity-70 mb-4">
                        Enter your credentials
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">

                        {/* EMAIL */}
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 ${isDark
                                ? "bg-black border-white/20"
                                : "bg-white border-black/20"
                                }`}
                        />

                        {/* PASSWORD */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-sky-500 ${isDark
                                    ? "bg-black border-white/20"
                                    : "bg-white border-black/20"
                                    }`}
                            />
                            <span
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-3 cursor-pointer text-gray-400"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
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
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* OR */}
                    <div className="flex items-center my-5">
                        <div className="flex-grow border-t opacity-20"></div>
                        <span className="px-3 text-sm opacity-60">OR</span>
                        <div className="flex-grow border-t opacity-20"></div>
                    </div>

                    {/* GOOGLE LOGIN */}
                    <button
                        onClick={() => {
                            // Implement Google OAuth flow here
                            toast.info("Google login coming soon!");
                        }}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border ${isDark
                            ? "border-white/20 hover:bg-white/10"
                            : "border-black/20 hover:bg-black/5"
                            }`}
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </button>
                    {/* FORGOT PASSWORD LINK */}
                    <div className="text-right py-2">
                        <button
                            type="button"
                            onClick={() => router.push("/forgot-password")}
                            className="text-sm text-sky-500 hover:text-sky-600 transition font-medium"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>
                
            </div>
        </main>
    );
}