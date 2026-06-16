import type { Config } from "tailwindcss";

/**
 * Design System: Amara NZero
 * Identidade visual focada em energia, sustentabilidade, tecnologia e inovação.
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
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
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--primary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      
      // Tipografia
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      
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
