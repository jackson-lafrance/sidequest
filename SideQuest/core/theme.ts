// SideQuest Theme - Modern Fantasy
// Based on the shield logo with cream, purple, gold, and brown

export const colors = {
    // Backgrounds - Dark purple theme
    background: '#1E1A2E',
    backgroundDark: '#151220',
    cardBackground: '#2A2540',
    
    // Primary - Purple (from shield, lighter for dark mode)
    primary: '#9A8CB0',
    primaryDark: '#7B6B95',
    primaryLight: '#B8ACCC',
    
    // Accent - Gold (from shield border)
    gold: '#D4A84B',
    goldLight: '#E5C866',
    goldDark: '#C9A227',
    
    // Secondary - Orange (from flag)
    accent: '#E5944D',
    accentLight: '#F0A868',
    
    // Text - Flipped for dark mode
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

export const fonts = {
    // Fantasy for big/important elements
    fantasyFamily: 'Georgia',
    // Clean modern for everything else
    bodyFamily: 'System',
    
    sizes: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 18,
        xl: 22,
        xxl: 28,
        hero: 34,
    },
    
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const borderRadius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    round: 999,
};

export const shadows = {
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    cardLifted: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 5,
    },
};

