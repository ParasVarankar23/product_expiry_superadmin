"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";

export default function ProfileCard() {
    const { mode } = useTheme();
    const { profile: authProfile, refreshProfile } = useAuth();

    const themeStyles = {
        light: {
            card: "bg-white text-gray-900 shadow-xl",
            label: "text-gray-700",
            input: "bg-gray-100 border border-gray-300 text-gray-800",
            disabled: "bg-gray-200 text-gray-500 cursor-not-allowed",
        },
        dark: {
            card: "bg-slate-900 text-gray-100 shadow-xl border border-slate-700",
            label: "text-gray-300",
            input: "bg-slate-800 border border-slate-600 text-gray-100",
            disabled: "bg-slate-700 text-gray-400 cursor-not-allowed",
        },
    };

    const T = themeStyles[mode] || themeStyles.light;

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

    const handleInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API;

        try {
            setLoading(true);

            await toast.promise(
                axiosInstance.put(
                    `${BACKEND}/superadmin/profile-update`,
                    {
                        name: form.name,
                        phoneNumber: form.phoneNumber,
                        address: form.address,
                        avatar: form.avatar,
                    }
                ),
                {
                    loading: "Updating profile...",
                    success: "Profile updated successfully!",
                    error: (err) =>
                        err.response?.data?.message ||
                        "Failed to update profile",
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
            <div className={`p-6 rounded-xl ${T.card}`}>
                <p className={T.label}>Unable to load profile.</p>
            </div>
        );
    }

    return (
        <div className={`max-w-3xl mx-auto p-6 rounded-2xl ${T.card}`}>

            {/* ACTION BUTTON */}
            <div className="flex justify-end mb-4">
                {editing ? (
                    <div className="flex gap-3">
                        <button
                            onClick={saveProfile}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <FaSave /> {loading ? "Saving..." : "Save"}
                        </button>

                        <button
                            onClick={() => setEditing(false)}
                            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <FaTimes /> Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <FaEdit /> Edit Profile
                    </button>
                )}
            </div>

            {/* PROFILE PHOTO */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <img
                        src={
                            form.avatar ||
                            "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                        }
                        alt="Profile"
                        className="w-40 h-40 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                    />

                    {editing && (
                        <>
                            <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer">
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
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                                >
                                    <FaTrash size={14} />
                                </button>
                            )}
                        </>
                    )}
                </div>

                <h2 className="text-2xl font-bold mt-4">
                    {authProfile.name}
                </h2>
                <p className={T.label}>{authProfile.email}</p>
            </div>

            {/* FORM */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* NAME */}
                <div>
                    <label className={T.label}>Name</label>
                    <input
                        name="name"
                        value={form.name}
                        disabled={!editing}
                        onChange={handleInput}
                        className={`w-full p-2 mt-1 rounded ${editing ? T.input : T.disabled}`}
                    />
                </div>

                {/* EMAIL (NON EDITABLE) */}
                <div>
                    <label className={T.label}>Email</label>
                    <input
                        value={authProfile.email}
                        disabled
                        className={`w-full p-2 mt-1 rounded ${T.disabled}`}
                    />
                </div>

                {/* PHONE */}
                <div>
                    <label className={T.label}>Phone Number</label>
                    <input
                        name="phoneNumber"
                        value={form.phoneNumber}
                        disabled={!editing}
                        onChange={handleInput}
                        className={`w-full p-2 mt-1 rounded ${editing ? T.input : T.disabled}`}
                    />
                </div>
            </div>

            {/* ADDRESS */}
            <div className="mt-4">
                <label className={T.label}>Address</label>
                <textarea
                    name="address"
                    rows={2}
                    value={form.address}
                    disabled={!editing}
                    onChange={handleInput}
                    className={`w-full p-2 mt-1 rounded ${editing ? T.input : T.disabled}`}
                />
            </div>

        </div>
    );
}