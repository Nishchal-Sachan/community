import type { Config } from "tailwindcss";

/**
 * Tailwind v4: design tokens and font stacks live in `styles/tailwind-theme.css` (`@theme`).
 * This config declares content paths for editors and any tooling that reads `tailwind.config`.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} satisfies Config;
