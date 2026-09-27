import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2540',
          dark: '#061727',
          hover: '#14385E',
          surface: '#0F2F50',
        },
        teal: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          surface: '#F0FDFA',
          border: '#CCFBF1',
        },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        charcoal: '#0F172A',
        steel: '#64748B',
        'subtle-border': '#E2E8F0',
        success: {
          DEFAULT: '#059669',
          surface: '#ECFDF5',
          border: '#A7F3D0',
        },
        pending: {
          DEFAULT: '#D97706',
          surface: '#FFFBEB',
          border: '#FDE68A',
        },
        danger: {
          DEFAULT: '#DC2626',
          surface: '#FEF2F2',
          border: '#FECACA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;

