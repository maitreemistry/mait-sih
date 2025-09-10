/**
 * Agriculture-themed colors for the farmer app. The colors are designed to evoke growth, nature, and prosperity.
 * Primary colors: Earthy greens and browns representing soil and crops
 * Accent colors: Warm oranges and yellows representing harvest and sunlight
 */

const tintColorLight = '#2E7D32'; // Deep forest green
const tintColorDark = '#81C784'; // Light green

export const Colors = {
  light: {
    text: '#1B5E20', // Dark green text
    background: '#F1F8E9', // Very light green background
    tint: tintColorLight,
    icon: '#4CAF50', // Medium green icons
    tabIconDefault: '#66BB6A', // Light green default tab icons
    tabIconSelected: tintColorLight,
    card: '#FFFFFF', // White cards
    border: '#C8E6C9', // Light green borders
    success: '#4CAF50', // Green for success states
    warning: '#FF9800', // Orange for warnings
    error: '#F44336', // Red for errors
    primary: '#2E7D32', // Deep green primary
    secondary: '#8BC34A', // Light green secondary
    accent: '#FFC107', // Amber accent for highlights
    surface: '#E8F5E8', // Light green surface
  },
  dark: {
    text: '#E8F5E8', // Light green text on dark
    background: '#0D1B0D', // Very dark green background
    tint: tintColorDark,
    icon: '#81C784', // Light green icons
    tabIconDefault: '#4CAF50', // Medium green default tab icons
    tabIconSelected: tintColorDark,
    card: '#1B2E1B', // Dark green cards
    border: '#2E7D32', // Medium green borders
    success: '#81C784', // Light green for success
    warning: '#FFB74D', // Light orange for warnings
    error: '#EF5350', // Light red for errors
    primary: '#81C784', // Light green primary
    secondary: '#4CAF50', // Medium green secondary
    accent: '#FFD54F', // Light amber accent
    surface: '#0F1F0F', // Dark green surface
  },
};
