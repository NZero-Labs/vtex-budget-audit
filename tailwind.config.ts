import type { Config } from "tailwindcss";

/**
 * Design System: Amara NZero
 * Identidade visual focada em energia, sustentabilidade, tecnologia e inovação.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Habilita dark mode via classe
  theme: {
    extend: {
      // Cores do brand Amara NZero
      colors: {
        // Primary - Greens
        'green-main': '#00953b',    // Pantone 355 - brand, primary-buttons, highlights
        'green-light': '#76bc21',   // Pantone 368 - secondary-buttons, hover-states
        'green-lime': '#c1d116',    // Pantone 382 - accent, alerts, info-badges
        
        // Secondary - Neutrals
        'brand-black': '#3c3c3b',   // primary-text, titles, icons
        'grey-dark': '#575756',     // subtitles, labels
        'grey-medium': '#9d9c9c',   // secondary-text, borders, disabled
        
        // Complementary
        'brand-yellow': '#ffc000',  // Pantone 7548 - warnings, attention
        'brand-cyan': '#1c9bd8',    // info, links, charts
        'brand-blue': '#2e75b6',    // Pantone 660 - secondary-info
        
        // Status
        'status-success': '#00953b',
        'status-warning': '#ffc000',
        'status-error': '#d32f2f',
        'status-info': '#1c9bd8',
        
        // Dashboard specific
        'card-bg': '#f9f9f9',
        'row-hover': '#f1f7f3',
        
        // Legacy compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      
      // Tipografia
      fontFamily: {
        'dialog': ['Dialog', 'system-ui', 'sans-serif'],
        'lato': ['Lato', 'system-ui', 'sans-serif'],
      },
      
      // Border Radius
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      
      // Spacing (extending Tailwind defaults)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      
      // Shadows
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'modal': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      
      // Gradients via backgroundImage
      backgroundImage: {
        'corporate-gradient': 'linear-gradient(to right, #00953b, #c1d116)',
      },
    },
  },
  plugins: [],
} satisfies Config;
