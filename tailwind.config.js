/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(230 15% 96%)',
        accent: 'hsl(180 70% 50%)',
        primary: 'hsl(240 100% 50%)',
        surface: 'hsl(0 0% 100%)',
        'text-primary': 'hsl(220 15% 15%)',
        'text-secondary': 'hsl(220 15% 45%)',
        'dark-bg': 'hsl(240 10% 8%)',
        'dark-surface': 'hsl(240 10% 12%)',
        'dark-border': 'hsl(240 10% 18%)',
        'dark-text': 'hsl(220 15% 85%)',
        'dark-text-secondary': 'hsl(220 15% 65%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 8px 24px hsla(0, 0%, 0%, 0.12)',
        'modal': '0 12px 36px hsla(0, 0%, 0%, 0.16)',
      },
      fontSize: {
        'caption': ['0.875rem', { fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.75', fontWeight: '400' }],
        'heading': ['1.5rem', { fontWeight: '700' }],
        'display': ['3rem', { fontWeight: '800' }],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}