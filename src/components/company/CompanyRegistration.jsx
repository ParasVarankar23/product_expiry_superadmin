"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { Check } from "lucide-react";

const planOptions = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Up to 50 users • Basic access • 1 year validity",
  },
  {
    id: "basic",
    name: "Basic",
    price: 999,
    description: "Up to 200 users • Dashboard access • Priority support",
  },
  {
    id: "premium",
    name: "Premium",
    price: 1999,
    description: "Unlimited users • Full analytics • Dedicated support",
  },
];

export default function CompanyRegistration() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    companyName: "",
    plan: "free",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCancel = () => {
    setFormData({
      ownerName: "",
      ownerEmail: "",
      companyName: "",
      plan: "free",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        `/superadmin/create-company`,
        formData
      );

      toast.success("Company Created Successfully");
      toast.success(`Company Code: ${res.data.companyCode}`);

      handleCancel();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `w-full p-4 rounded-xl border outline-none transition
    ${isDark
      ? "bg-black border-white/20 text-white focus:border-white"
      : "bg-white border-black/20 text-black focus:border-black"
    }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-6
        ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div
        className={`w-full max-w-4xl rounded-2xl p-10
          ${isDark
            ? "border border-white/20 bg-black"
            : "border border-black/20 bg-white"
          }`}
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Company Registration
        </h2>

        <p className="text-center opacity-60 mb-10">
          Create and activate a company subscription
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ROW 1: OWNER NAME & EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="ownerName"
              placeholder="Owner Name"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className={inputStyle}
            />

            <input
              type="email"
              name="ownerEmail"
              placeholder="Owner Email"
              value={formData.ownerEmail}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          {/* ROW 2: COMPANY NAME */}
          <div>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          {/* ROW 3: PLAN SELECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planOptions.map((plan) => (
              <div
                key={plan.id}
                onClick={() =>
                  setFormData({ ...formData, plan: plan.id })
                }
                className={`relative p-6 rounded-xl cursor-pointer transition-all
                  ${formData.plan === plan.id
                    ? isDark
                      ? "border-2 border-white"
                      : "border-2 border-black"
                    : isDark
                      ? "border border-white/20"
                      : "border border-black/20"
                  }`}
              >
                {formData.plan === plan.id && (
                  <Check size={18} className="absolute top-4 right-4" />
                )}

                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">
                  ₹{plan.price}
                </p>

                <p className="text-sm opacity-60 mt-3 leading-relaxed">
                  {plan.description}
                </p>
              </div>
            ))}
          </div>

          {/* ROW 4: BUTTONS */}
          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={handleCancel}
              className={`px-8 py-3 rounded-xl font-medium transition
                ${isDark
                  ? "border border-white/30 text-white hover:bg-white/10"
                  : "border border-black/30 text-black hover:bg-black/5"
                }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-medium transition
                ${isDark
                  ? "bg-white text-black hover:opacity-80"
                  : "bg-black text-white hover:opacity-80"
                }`}
            >
              {loading ? "Processing..." : "Register"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}