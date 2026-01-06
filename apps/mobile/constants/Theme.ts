export const COLORS = {
    primary: '#007AFF', // Classic Blue
    secondary: '#5856D6', // Purple
    success: '#34C759', // Green
    danger: '#FF3B30', // Red
    warning: '#FF9500', // Orange
    text: '#000000',
    textSecondary: '#666666',
    background: '#F2F2F7', // iOS grouped background
    card: '#FFFFFF',
    white: '#FFFFFF',
};

export const GRADIENTS = {
    // Premium Blue-Purple
    primary: ['#007AFF', '#5856D6'],

    // Wealth/Growth Green
    success: ['#34C759', '#30B0C7'],

    // Alert/Expense Red-Orange
    danger: ['#FF3B30', '#FF9500'],

    // Sleek Dark (optional for specialized cards)
    dark: ['#2C2C2E', '#1C1C1E'],

    // Subtle Metallic/White (for standard cards with a premium feel)
    card: ['#FFFFFF', '#F2F2F7'],
    default: ['#FFFFFF', '#F2F2F7'],
};

export const SPACING = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const BORDER_RADIUS = {
    s: 8,
    m: 12,
    l: 20, // Providing that smooth modern look
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
};
