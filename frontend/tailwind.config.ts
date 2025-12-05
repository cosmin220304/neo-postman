import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Design System: Linear/Modern (from ui-guidelines.md)
      colors: {
        // Background layers
        'bg-deep': '#020203',
        'bg-base': '#050506',
        'bg-elevated': '#0a0a0c',

        // Surface colors
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
        },

        // Text colors
        foreground: {
          DEFAULT: '#EDEDEF',
          muted: '#8A8F98',
          subtle: 'rgba(255,255,255,0.60)',
        },

        // Accent colors
        accent: {
          DEFAULT: '#5E6AD2',
          bright: '#6872D9',
          glow: 'rgba(94,106,210,0.3)',
        },

        // Border colors
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.10)',
          accent: 'rgba(94,106,210,0.30)',
        },

        // HTTP Method colors
        method: {
          get: '#10B981',
          post: '#3B82F6',
          put: '#F59E0B',
          patch: '#8B5CF6',
          delete: '#EF4444',
          head: '#6B7280',
          options: '#6B7280',
        },

        // Status code colors
        status: {
          success: '#10B981',
          redirect: '#3B82F6',
          'client-error': '#F59E0B',
          'server-error': '#EF4444',
        },
      },

      // Multi-layer shadows (signature element)
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)',
        'card-hover':
          '0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1)',
        'accent-glow':
          '0 0 0 1px rgba(94,106,210,0.5), 0 4px 12px rgba(94,106,210,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)',
        'inner-highlight': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },

      // Animations
      animation: {
        float: 'float 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(94,106,210,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(94,106,210,0.5)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // Timing functions (expo-out for precision)
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // Background gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-card': 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        'gradient-text': 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))',
      },

      // Font family
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // Border radius
      borderRadius: {
        '2xl': '16px',
        xl: '12px',
        lg: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config;
