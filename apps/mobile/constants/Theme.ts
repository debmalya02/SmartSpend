// Premium Dark Theme with Warm Gradient Lighting
export const COLORS = {
    // Core Dark Palette
    background: '#0A0A0F',
    backgroundSecondary: '#12121A',
    surface: '#1A1A24',
    surfaceLight: '#242432',
    
    // Accent Colors - Warm Red-Orange Gradient Base
    primary: '#FF6B4A',
    primaryLight: '#FF8A6B',
    primaryDark: '#E55A3C',
    secondary: '#FF9F43',
    accent: '#FFD93D',
    
    // Semantic Colors
    success: '#00D68F',
    successLight: '#00FFB3',
    danger: '#FF4757',
    dangerLight: '#FF6B7A',
    warning: '#FFA502',
    info: '#3498DB',
    
    // Text Colors
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textDark: 'rgba(255, 255, 255, 0.3)',
    
    // Glass Effect Colors
    glass: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassLight: 'rgba(255, 255, 255, 0.15)',
    
    // Glow Colors
    glowPrimary: 'rgba(255, 107, 74, 0.4)',
    glowSecondary: 'rgba(255, 159, 67, 0.3)',
    glowSuccess: 'rgba(0, 214, 143, 0.3)',
    
    // Legacy compatibility
    card: '#1A1A24',
    border: 'rgba(255, 255, 255, 0.12)',
    white: '#FFFFFF',
};

export const GRADIENTS = {
    // Primary Warm Gradient - Red to Orange
    primary: ['#FF6B4A', '#FF9F43'],
    primaryIntense: ['#FF4757', '#FF6B4A', '#FF9F43'],
    
    // Premium Gold Accent
    gold: ['#FFD93D', '#FF9F43'],
    
    // Success/Growth Gradient
    success: ['#00D68F', '#00FFB3'],
    successSubtle: ['rgba(0, 214, 143, 0.2)', 'rgba(0, 255, 179, 0.1)'],
    
    // Danger/Alert Gradient
    danger: ['#FF4757', '#FF6B7A'],
    dangerSubtle: ['rgba(255, 71, 87, 0.2)', 'rgba(255, 107, 122, 0.1)'],
    
    // Dark Ambient Gradients
    dark: ['#1A1A24', '#0A0A0F'],
    darkReverse: ['#0A0A0F', '#1A1A24'],
    surface: ['#242432', '#1A1A24'],
    
    // Glass Card Gradients
    glass: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.05)'],
    glassWarm: ['rgba(255, 107, 74, 0.15)', 'rgba(255, 159, 67, 0.08)'],
    
    // Background Ambient Glow
    ambientGlow: ['rgba(255, 107, 74, 0.08)', 'transparent'],
    ambientGlowBottom: ['transparent', 'rgba(255, 107, 74, 0.05)'],
    
    // Card Variants
    card: ['rgba(26, 26, 36, 0.9)', 'rgba(18, 18, 26, 0.95)'],
    default: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)'],
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const BORDER_RADIUS = {
    xs: 6,
    s: 10,
    m: 16,
    l: 24,
    xl: 32,
    round: 100,
};

export const SHADOWS = {
    // Subtle Glow
    glow: {
        shadowColor: '#FF6B4A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    // Soft Neumorphic
    neumorphic: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    // Card Shadow
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    // Floating Element
    float: {
        shadowColor: '#FF6B4A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    // Subtle Inner
    inner: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    // Legacy compatibility
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
};

export const TYPOGRAPHY = {
    hero: {
        fontSize: 42,
        fontWeight: '800' as const,
        letterSpacing: -1,
    },
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
    },
    bodyBold: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    caption: {
        fontSize: 14,
        fontWeight: '500' as const,
    },
    small: {
        fontSize: 12,
        fontWeight: '500' as const,
    },
    button: {
        fontSize: 16,
        fontWeight: '700' as const,
        letterSpacing: 0.5,
    },
};
