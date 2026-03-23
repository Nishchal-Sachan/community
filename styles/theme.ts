/**
 * Design tokens — canonical values for the app.
 * Tailwind utilities are registered from the same hex values in `styles/tailwind-theme.css` (@theme).
 * When you change a token, update both files together.
 */
export const theme = {
  colors: {
    primary: "#F57C00",
    primaryHover: "#E65100",
    secondary: "#1A1A1A",
    accent: "#2E7D32",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    backgroundLight: "#F9F9F9",
    backgroundWhite: "#FFFFFF",
    textPrimary: "#222",
    textSecondary: "#666",
    textMuted: "#999",
    borderMuted: "#E8E8E8",
  },
  fonts: {
    heading: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
    body: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  layout: {
    /** Marketing sections: `.section-spacing` in tailwind-theme.css */
    sectionY: "py-16 md:py-24",
    /** `Container`: max-w-7xl mx-auto px-6 md:px-12 */
    containerMaxClass: "max-w-7xl",
    containerPaddingX: "px-6 md:px-12",
  },
} as const;

export type Theme = typeof theme;
