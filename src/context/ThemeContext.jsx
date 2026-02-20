'use client'

import { createContext, useContext, useLayoutEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light')

    // useLayoutEffect runs before paint so we avoid a flash of incorrect theme
    useLayoutEffect(() => {
        const stored = localStorage.getItem('theme')

        // Remove any existing theme classes to ensure a single source of truth
        document.documentElement.classList.remove('dark', 'light')

        if (stored) {
            setTheme(stored)
            document.documentElement.classList.add(stored)
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const defaultTheme = prefersDark ? 'dark' : 'light'
            setTheme(defaultTheme)
            document.documentElement.classList.add(defaultTheme)
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)

        // Ensure we only have the active theme class on the document element
        document.documentElement.classList.remove('dark', 'light')
        document.documentElement.classList.add(newTheme)

        localStorage.setItem('theme', newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme must be used within ThemeProvider")
    return context
}
