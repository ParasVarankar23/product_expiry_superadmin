"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";

export default function ProfileCard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const { profile: authProfile, refreshProfile } = useAuth();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phoneNumber: "",
        address: "",
        avatar: "",
    });

    /* ================= INIT PROFILE ================= */
    useEffect(() => {
        if (authProfile) {
            setForm({
                name: authProfile.name || "",
                phoneNumber: authProfile.phoneNumber || "",
                address: authProfile.address || "",
                avatar: authProfile.avatar || "",
            });
        }
    }, [authProfile]);

    const handleInput = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    /* ================= PHOTO UPLOAD ================= */
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be under 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm({ ...form, avatar: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setForm({ ...form, avatar: "" });
        toast.success("Photo removed");
    };

    /* ================= SAVE PROFILE ================= */
    const saveProfile = async () => {
        try {
            setLoading(true);

            await toast.promise(
                axiosInstance.put(`/superadmin/profile-update`, {
                    name: form.name,
                    phoneNumber: form.phoneNumber,
                    address: form.address,
                    avatar: form.avatar,
                }),
                {
                    loading: "Updating profile...",
                    success: "Profile updated successfully!",
                    error: (err) =>
                        err.response?.data?.message || "Failed to update profile",
                }
            );

            await refreshProfile();
            setEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!authProfile) {
        return (
            <div className="p-10 text-center opacity-70">
                Unable to load profile.
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen p-12 transition-all
        ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"}`}
        >
            <div
                className={`max-w-3xl mx-auto rounded-2xl p-10 border
          ${isDark
                        ? "bg-zinc-900 border-white/10"
                        : "bg-white border-gray-200 shadow-sm"
                    }`}
            >
                {/* HEADER ACTIONS */}
                <div className="flex justify-end mb-8">
                    {editing ? (
                        <div className="flex gap-4">
                            <button
                                onClick={saveProfile}
                                disabled={loading}
                                className={`px-5 py-2 rounded-xl transition
                  ${isDark
                                        ? "bg-white text-black hover:opacity-80"
                                        : "bg-black text-white hover:opacity-80"
                                    }
                `}
                            >
                                <FaSave className="inline mr-2" />
                                {loading ? "Saving..." : "Save"}
                            </button>

                            <button
                                onClick={() => setEditing(false)}
                                className={`px-5 py-2 rounded-xl border transition
                  ${isDark
                                        ? "border-white/20 hover:bg-white/10"
                                        : "border-gray-300 hover:bg-gray-100"
                                    }
                `}
                            >
                                <FaTimes className="inline mr-2" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className={`px-5 py-2 rounded-xl transition
                ${isDark
                                    ? "bg-white text-black hover:opacity-80"
                                    : "bg-black text-white hover:opacity-80"
                                }
              `}
                        >
                            <FaEdit className="inline mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* AVATAR */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative">
                        <img
                            src={
                                form.avatar ||
                                "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                            }
                            alt="Profile"
                            className="w-40 h-40 rounded-full object-cover border border-gray-300 dark:border-white/20"
                        />

                        {editing && (
                            <>
                                <label
                                    className={`absolute bottom-2 right-2 p-3 rounded-full cursor-pointer
                    ${isDark
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                        }`}
                                >
                                    <FaCamera />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>

                                {form.avatar && (
                                    <button
                                        onClick={removePhoto}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <h2 className="text-2xl font-semibold mt-4">
                        {authProfile.name}
                    </h2>
                    <p className="opacity-60">{authProfile.email}</p>
                </div>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <InputField
                        label="Name"
                        name="name"
                        value={form.name}
                        disabled={!editing}
                        onChange={handleInput}
                        isDark={isDark}
                    />

                    <InputField
                        label="Email"
                        value={authProfile.email}
                        disabled
                        isDark={isDark}
                    />

                    <InputField
                        label="Phone Number"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        disabled={!editing}
                        onChange={handleInput}
                        isDark={isDark}
                    />
                </div>

                <div className="mt-6">
                    <label className="text-sm opacity-60">Address</label>
                    <textarea
                        name="address"
                        rows={3}
                        value={form.address}
                        disabled={!editing}
                        onChange={handleInput}
                        className={`w-full mt-2 px-4 py-3 rounded-xl border transition
              ${isDark
                                ? "bg-black border-white/20 text-white"
                                : "bg-white border-gray-300"
                            }
              ${!editing ? "opacity-70 cursor-not-allowed" : ""}
            `}
                    />
                </div>
            </div>
        </div>
    );
}

/* ================= REUSABLE INPUT ================= */

function InputField({
    label,
    name,
    value,
    disabled,
    onChange,
    isDark,
}) {
    return (
        <div>
            <label className="text-sm opacity-60">{label}</label>
            <input
                name={name}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className={`w-full mt-2 px-4 py-3 rounded-xl border transition
          ${isDark
                        ? "bg-black border-white/20 text-white"
                        : "bg-white border-gray-300"
                    }
          ${disabled ? "opacity-70 cursor-not-allowed" : ""}
        `}
            />
        </div>
    );
}