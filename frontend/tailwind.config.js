/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Clinical Indigo" — trustworthy, evokes scrubs and monitor glow.
        clinical: {
          50: '#EEF1F8',
          100: '#D6DCEC',
          200: '#AEB9D9',
          300: '#8695C2',
          400: '#5A6BA0',
          500: '#3A4A7C',
          600: '#2B3A67', // primary
          700: '#212C4F',
          800: '#171F38',
          900: '#0F1526',
        },
        // "Pulse Coral" — vital-sign warmth, used sparingly for CTAs.
        pulse: {
          50: '#FDEEEA',
          100: '#FAD3C7',
          200: '#F4AE99',
          300: '#EE8A6C',
          400: '#EA774F', // accent
          500: '#E8674D',
          600: '#C74F38',
          700: '#9E3C2A',
        },
        vital: {
          500: '#3FA796', // success
        },
        alert: {
          500: '#E2A93A', // warning
        },
        critical: {
          500: '#D64550', // danger
        },
        surface: {
          light: '#F7F8FA',
          dark: '#12161C',
        },
        ink: {
          light: '#1B2430',
          dark: '#E7EBF0',
        },
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '0.875rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 21, 38, 0.06), 0 1px 12px -2px rgba(15, 21, 38, 0.08)',
      },
    },
  },
  plugins: [],
};
