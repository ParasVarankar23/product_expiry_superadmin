'use client'

import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext()

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API

/**
 * Decode JWT payload (safely extract id + sessionId only)
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
            sessionId: decoded.sessionId,
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
    if (!decoded || !decoded.exp) return true

    // Check if token expires within 1 minute
    const expirationTime = decoded.exp * 1000
    return expirationTime <= Date.now() + 60000
}

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null)
    const [refreshToken, setRefreshToken] = useState(null)
    const [profile, setProfile] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    /**
     * Fetch user profile from backend
     * This is the source of truth for role, email, permissions, etc.
     */
    const fetchProfile = async (token) => {
        try {
            setError(null)
            const res = await axios.get(`${BACKEND}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const profileData = res.data?.data || res.data
            setProfile(profileData)
            setIsAuthenticated(true)
            return profileData
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            setError(err.response?.data?.message || 'Failed to fetch profile')
            setProfile(null)
            setIsAuthenticated(false)

            // If profile fetch fails, clear tokens
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            setAccessToken(null)
            setRefreshToken(null)

            throw err
        }
    }

    /**
     * Refresh access token using refresh token
     */
    const refreshAccessToken = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken')
            if (!storedRefreshToken) {
                throw new Error('No refresh token available')
            }

            const response = await axios.post(`${BACKEND}/auth/refresh`, {
                refreshToken: storedRefreshToken,
            })

            const resData = response?.data || {}

            let newAccessToken = resData.accessToken || resData.data?.accessToken || resData.tokens?.accessToken || null
            let newRefreshToken = resData.refreshToken || resData.data?.refreshToken || resData.tokens?.refreshToken || storedRefreshToken

            // Fallback to header
            if (!newAccessToken) {
                const authHeader = response?.headers?.authorization || response?.headers?.Authorization
                if (authHeader && typeof authHeader === 'string') {
                    const parts = authHeader.split(' ')
                    newAccessToken = parts.length === 2 ? parts[1] : authHeader
                }
            }

            // If backend uses httpOnly cookie and didn't return token bodies/headers,
            // assume refresh succeeded when status === 200 and try to fetch profile using cookie.
            if (!newAccessToken) {
                if (response && response.status === 200) {
                    localStorage.removeItem('accessToken')
                    setAccessToken(null)
                    setRefreshToken(storedRefreshToken)
                    const profileData = await fetchProfile(null)
                    return profileData ? profileData.accessToken || null : null
                }

                throw new Error('No new access token received')
            }

            // Store and set tokens
            localStorage.setItem('accessToken', newAccessToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            setAccessToken(newAccessToken)
            setRefreshToken(newRefreshToken)

            return newAccessToken
        } catch (err) {
            console.error('Failed to refresh access token:', err)

            // If refresh fails, logout user
            await logout()
            throw err
        }
    }

    /**
     * Refresh user profile
     */
    const refreshProfile = async () => {
        const storedToken = localStorage.getItem('accessToken')
        if (!storedToken) {
            setIsAuthenticated(false)
            setProfile(null)
            setAccessToken(null)
            return null
        }

        try {
            return await fetchProfile(storedToken)
        } catch (err) {
            console.error('Profile refresh failed:', err)
            return null
        }
    }

    /**
     * Login: store tokens + fetch profile
     */
    const login = async (emailOrPhone, password) => {
        try {
            setError(null)
            setIsLoading(true)

            // Call backend login
            const response = await axios.post(`${BACKEND}/auth/login`, {
                emailOrPhone,
                password,
            })

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

            if (!newAccessToken || !newRefreshToken) {
                throw new Error('No tokens received from backend')
            }

            // Store tokens in localStorage
            localStorage.setItem('accessToken', newAccessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            setAccessToken(newAccessToken)
            setRefreshToken(newRefreshToken)

            // Immediately fetch profile
            const profileData = await fetchProfile(newAccessToken)

            return {
                success: true,
                profile: profileData,
                accessToken: newAccessToken
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed'
            setError(message)
            setIsAuthenticated(false)
            setProfile(null)
            setAccessToken(null)
            setRefreshToken(null)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Logout: clear tokens + profile
     */
    const logout = async () => {
        try {
            const token = accessToken || localStorage.getItem('accessToken')
            if (token) {
                // Call backend logout endpoint
                await axios.post(
                    `${BACKEND}/auth/logout`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                ).catch(err => console.warn('Backend logout failed:', err))
            }
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            // Clear everything regardless of backend success
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            setAccessToken(null)
            setRefreshToken(null)
            setProfile(null)
            setIsAuthenticated(false)
            setError(null)
        }
    }

    /**
     * On mount: check if tokens exist in localStorage and restore auth state
     */
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedAccessToken = localStorage.getItem('accessToken')
                const storedRefreshToken = localStorage.getItem('refreshToken')

                if (!storedAccessToken || !storedRefreshToken) {
                    setIsAuthenticated(false)
                    setProfile(null)
                    setIsLoading(false)
                    return
                }

                setAccessToken(storedAccessToken)
                setRefreshToken(storedRefreshToken)

                // Check if access token is expired
                if (isTokenExpired(storedAccessToken)) {
                    // Try to refresh it
                    try {
                        const newAccessToken = await refreshAccessToken()
                        await fetchProfile(newAccessToken)
                    } catch (err) {
                        console.error('Auto-refresh failed, logging out:', err)
                        await logout()
                    }
                } else {
                    // Token is still valid, fetch profile
                    await fetchProfile(storedAccessToken)
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
                setIsAuthenticated(false)
                setProfile(null)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const value = useMemo(() => ({
        accessToken,
        refreshToken,
        profile,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        refreshProfile,
        refreshAccessToken,
    }), [accessToken, refreshToken, profile, isAuthenticated, isLoading, error])

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

