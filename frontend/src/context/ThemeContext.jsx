import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * ThemeContext — Dark/Light Mode Toggle with Persistent User Preferences
 * 
 * Features:
 * - System preference detection (prefers-color-scheme)
 * - localStorage persistence across sessions
 * - CSS custom property overrides via data-theme attribute
 * - Smooth transitions between themes
 * - Three modes: 'light', 'dark', 'system'
 */

const STORAGE_KEY = 'hirehub_theme_preference';

const ThemeContext = createContext(null);

/**
 * Resolves effective theme from user preference + system setting
 */
function resolveTheme(preference) {
    if (preference === 'dark' || preference === 'light') return preference;
    // System preference
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

export function ThemeProvider({ children }) {
    const [preference, setPreference] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || 'system';
        } catch {
            return 'system';
        }
    });

    const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(preference));

    // Apply theme to document
    const applyTheme = useCallback((theme) => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);

        // Update PWA theme-color meta tag dynamically
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#0a66c2');
        }
    }, []);

    // Listen to system preference changes when mode is 'system'
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemChange = (e) => {
            if (preference === 'system') {
                const newTheme = e.matches ? 'dark' : 'light';
                setResolvedTheme(newTheme);
                applyTheme(newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [preference, applyTheme]);

    // Apply theme on preference change
    useEffect(() => {
        const theme = resolveTheme(preference);
        setResolvedTheme(theme);
        applyTheme(theme);

        try {
            localStorage.setItem(STORAGE_KEY, preference);
        } catch {}
    }, [preference, applyTheme]);

    /**
     * Toggle between dark, light, and system modes
     */
    const toggleTheme = useCallback(() => {
        setPreference((prev) => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    }, []);

    /**
     * Set specific theme mode
     */
    const setTheme = useCallback((mode) => {
        if (['light', 'dark', 'system'].includes(mode)) {
            setPreference(mode);
        }
    }, []);

    const value = {
        theme: resolvedTheme,       // 'light' or 'dark' (resolved)
        preference,                  // 'light', 'dark', or 'system' (raw user preference)
        isDark: resolvedTheme === 'dark',
        isLight: resolvedTheme === 'light',
        isSystem: preference === 'system',
        toggleTheme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return context;
}

export default ThemeContext;
