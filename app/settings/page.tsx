"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { getUserProfile, updateUserProfile } from "@/services/api"

export default function SettingsPage() {
    const { user, setUser, logout } = useUser()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        emailAlerts: false,
        smsAlerts: false,
        twoFactorAuth: false,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile()
                setFormData({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    emailAlerts: response.data.emailAlerts || false,
                    smsAlerts: response.data.smsAlerts || false,
                    twoFactorAuth: response.data.twoFactorAuth || false,
                })
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchProfile()
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            const response = await updateUserProfile(formData.name, formData.email, formData.phone)
            setMessage("Settings updated successfully")
            if (setUser && user) {
                setUser({ ...user, name: formData.name })
            }
        } catch (error) {
            setMessage("Error updating settings")
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    if (!user) {
        return <div>Please log in to view settings</div>
    }

    if (loading) {
        return <div>Loading settings...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {message && (
                    <div
                        className={`p-4 mb-4 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="emailAlerts"
                                    checked={formData.emailAlerts}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2">Receive email alerts</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="smsAlerts"
                                    checked={formData.smsAlerts}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2">Receive SMS alerts</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="twoFactorAuth"
                                    checked={formData.twoFactorAuth}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2">Enable two-factor authentication</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                        <button
                            type="button"
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            onClick={() => {
                                logout()
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

