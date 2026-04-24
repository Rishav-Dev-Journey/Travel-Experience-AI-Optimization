/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#e2e8f0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"Manrope"', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: 0, transform: 'translateY(18px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.45 },
          '50%': { opacity: 0.85 },
        },
      },
      animation: {
        floatIn: 'floatIn 550ms ease-out both',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 25px 80px rgba(15, 23, 42, 0.22)',
      },
    },
  },
  plugins: [],
};
