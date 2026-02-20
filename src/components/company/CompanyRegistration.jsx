"use client";

import axiosInstance from "@/lib/axiosInstance";
import { useState } from "react";
import toast from "react-hot-toast";

const planOptions = [
  { id: "free", name: "Free", price: 0 },
  { id: "basic", name: "Basic", price: 999 },
  { id: "premium", name: "Premium", price: 1999 },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CompanyRegistration() {

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    companyName: "",
    plan: "free",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // 1️⃣ CREATE COMPANY
      const res = await axiosInstance.post(
        `/superadmin/create-company`,
        formData
      );

      // =====================
      // FREE PLAN
      // =====================
      if (!res.data.paymentRequired) {
        toast.success("Company Created Successfully 🎉");
        toast.success(`Company Code: ${res.data.companyCode}`);

        // Reset form
        setFormData({
          ownerName: "",
          ownerEmail: "",
          companyName: "",
          plan: "free",
        });

        setLoading(false);
        return;
      }

      // =====================
      // PAID PLAN FLOW
      // =====================

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK");
        setLoading(false);
        return;
      }

      // 2️⃣ CREATE ORDER
      const orderRes = await axios.post(
        `${API}/payment/create-order`,
        {
          companyId: res.data.companyId,
          plan: formData.plan,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: "INR",
        name: formData.companyName,
        description: `Subscription - ${formData.plan}`,
        order_id: orderRes.data.orderId,

        handler: async function (response) {
          try {
            // 3️⃣ VERIFY PAYMENT
            const verifyRes = await axios.post(
              `${API}/payment/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            toast.success("Payment Successful 🎉");
            toast.success("Company Activated Successfully 🚀");
            if (verifyRes.data.companyCode) {
              toast.success(`Company Code: ${verifyRes.data.companyCode}`);
            }

            // Reset form
            setFormData({
              ownerName: "",
              ownerEmail: "",
              companyName: "",
              plan: "free",
            });

          } catch (err) {
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: formData.ownerName,
          email: formData.ownerEmail,
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },

        theme: {
          color: "#2563EB",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-10">

        <h2 className="text-3xl font-bold text-center mb-8">
          Company Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="ownerName"
            placeholder="Owner Name"
            value={formData.ownerName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="email"
            name="ownerEmail"
            placeholder="Owner Email"
            value={formData.ownerEmail}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-xl"
          />

          <div className="grid grid-cols-3 gap-4">
            {planOptions.map((plan) => (
              <div
                key={plan.id}
                onClick={() =>
                  setFormData({ ...formData, plan: plan.id })
                }
                className={`p-4 border rounded-xl text-center cursor-pointer ${formData.plan === plan.id
                  ? "border-blue-600 shadow-lg"
                  : "border-gray-300"
                  }`}
              >
                <p className="font-bold">{plan.name}</p>
                <p className="text-blue-600 font-semibold">
                  ₹{plan.price}
                </p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold"
          >
            {loading ? "Processing..." : "Register Company"}
          </button>

        </form>
      </div>
    </div>
  );
}