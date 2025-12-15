import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export const darkColors = {
    // Backgrounds - Dark purple theme
    background: '#1E1A2E',
    backgroundDark: '#151220',
    cardBackground: '#2A2540',
    headerBackground: '#2D2254',
    
    // Primary - Purple
    primary: '#9A8CB0',
    primaryDark: '#7B6B95',
    primaryLight: '#B8ACCC',
    
    // Accent - Gold
    gold: '#D4A84B',
    goldLight: '#E5C866',
    goldDark: '#C9A227',
    
    // Secondary - Orange
    accent: '#E5944D',
    accentLight: '#F0A868',
    
    // Text
    textPrimary: '#F5F0E6',
    textSecondary: '#C4BAA8',
    textMuted: '#8A8090',
    textLight: '#FFFFFF',
    
    // Status
    success: '#6AAF6A',
    error: '#E06B6B',
    
    // Borders
    border: '#3D3655',
    borderGold: '#D4A84B',
};

export const lightColors = {
    // Backgrounds - Cream/beige theme
    background: '#F5F0E6',
    backgroundDark: '#E8E2D6',
    cardBackground: '#FFFFFF',
    headerBackground: '#5B4B8A',
    
    // Primary - Purple
    primary: '#5B4B8A',
    primaryDark: '#4A3D72',
    primaryLight: '#7B6B9A',
    
    // Accent - Gold
    gold: '#C9A227',
    goldLight: '#D4A84B',
    goldDark: '#A88A1F',
    
    // Secondary - Orange
    accent: '#D4843D',
    accentLight: '#E5944D',
    
    // Text
    textPrimary: '#2A2540',
    textSecondary: '#5A5470',
    textMuted: '#8A8090',
    textLight: '#FFFFFF',
    
    // Status
    success: '#5A9F5A',
    error: '#D45A5A',
    
    // Borders
    border: '#E0D8CC',
    borderGold: '#C9A227',
};

interface ThemeContextType {
    mode: ThemeMode;
    colors: typeof darkColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@sidequest_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>('dark');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setMode(savedTheme);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveTheme = async (newMode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        setMode(newMode);
        saveTheme(newMode);
    };

    const setTheme = (newMode: ThemeMode) => {
        setMode(newMode);
        saveTheme(newMode);
    };

    const colors = mode === 'dark' ? darkColors : lightColors;

    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default useTheme;

