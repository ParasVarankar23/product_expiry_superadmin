'use client'

import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext()

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API

/**
 * Decode JWT payload (safely extract id and role)
 * Never use decoded data for authorization decisions
 */
function decodeToken(token) {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const decoded = JSON.parse(
            Buffer.from(parts[1], 'base64').toString()
        )

        return {
            id: decoded.id,
            role: decoded.role,
            exp: decoded.exp,
            iat: decoded.iat
        }
    } catch (err) {
        console.error('Failed to decode token:', err)
        return null
    }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
    const decoded = decodeToken(token)
    if (!decoded?.exp) return true

    // Check if token expires within 1 minute
    const expirationTime = decoded.exp * 1000
    return expirationTime <= Date.now() + 60000
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    /**
     * Login: store token + profile from backend response
     */
    const login = async (email, password) => {
        try {
            setError(null)
            setIsLoading(true)

            // Call backend superadmin login
            const response = await axios.post(`${BACKEND}/superadmin/login`, {
                email,
                password,
            })

            const { token: authToken, superadmin } = response.data

            if (!authToken || !superadmin) {
                throw new Error('Invalid response from server')
            }

            // Store token in localStorage
            localStorage.setItem('superadminToken', authToken)

            setToken(authToken)
            setProfile(superadmin)
            setIsAuthenticated(true)

            return {
                success: true,
                profile: superadmin,
                token: authToken
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed'
            setError(message)
            setIsAuthenticated(false)
            setProfile(null)
            setToken(null)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Google Login
     */
    const googleLogin = async (googleUser) => {
        try {
            setError(null)
            setIsLoading(true)

            const response = await axios.post(`${BACKEND}/superadmin/google-login`, googleUser)

            const { token: authToken, superadmin } = response.data

            if (!authToken || !superadmin) {
                throw new Error('Invalid response from server')
            }

            // Store token in localStorage
            localStorage.setItem('superadminToken', authToken)

            setToken(authToken)
            setProfile(superadmin)
            setIsAuthenticated(true)

            return {
                success: true,
                profile: superadmin,
                token: authToken
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Google login failed'
            setError(message)
            setIsAuthenticated(false)
            setProfile(null)
            setToken(null)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Logout: clear token + profile and invalidate session on backend
     */
    const logout = async () => {
        try {
            const storedToken = token || localStorage.getItem('superadminToken')

            // Call backend logout to invalidate session
            if (storedToken) {
                try {
                    await axios.post(
                        `${BACKEND}/superadmin/logout`,
                        {},
                        { headers: { Authorization: `Bearer ${storedToken}` } }
                    )
                } catch (err) {
                    console.warn('Backend logout failed:', err)
                }
            }
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            // Clear everything regardless of backend success
            localStorage.removeItem('superadminToken')
            setToken(null)
            setProfile(null)
            setIsAuthenticated(false)
            setError(null)
        }
    }

    /**
     * Update profile locally (for profile updates without re-login)
     */
    const updateProfile = (updatedData) => {
        setProfile(prev => ({ ...prev, ...updatedData }))
    }

    /**
     * On mount: check if token exists in localStorage and restore auth state
     */
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('superadminToken')

                if (!storedToken) {
                    setIsAuthenticated(false)
                    setProfile(null)
                    setIsLoading(false)
                    return
                }

                // Check if token is expired
                if (isTokenExpired(storedToken)) {
                    console.log('Token expired, logging out')
                    await logout()
                    setIsLoading(false)
                    return
                }

                // Token is valid, fetch profile from backend
                setToken(storedToken)

                try {
                    // Fetch fresh profile data from backend
                    const profileRes = await axios.get(`${BACKEND}/superadmin/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    })

                    if (profileRes.data.success && profileRes.data.superadmin) {
                        setProfile(profileRes.data.superadmin)
                        setIsAuthenticated(true)
                    } else {
                        throw new Error('Invalid profile response')
                    }
                } catch (profileErr) {
                    console.error('Failed to fetch profile:', profileErr)
                    // If profile fetch fails, clear auth and logout
                    await logout()
                }

            } catch (err) {
                console.error('Auth initialization error:', err)
                setIsAuthenticated(false)
                setProfile(null)
                await logout()
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const value = useMemo(() => ({
        token,
        profile,
        isAuthenticated,
        isLoading,
        error,
        login,
        googleLogin,
        logout,
        updateProfile,
    }), [token, profile, isAuthenticated, isLoading, error])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

// Export token decoder for internal use only (not for auth decisions)
export { decodeToken, isTokenExpired }
