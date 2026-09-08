/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          dark: '#121212',
          card: '#181818',
          hover: '#282828',
          light: '#B3B3B3',
        },
      },
      animation: {
        'pulse-green': 'pulseGreen 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'shake': 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'scan-line': 'scanLine 2.4s ease-in-out infinite',
        'wave-idle': 'waveIdle 1.4s ease-in-out infinite',
        'wave-live': 'waveLive 0.42s ease-in-out infinite alternate',
        'pulse-ring': 'pulseRing 2.2s ease-in-out infinite',
      },
      keyframes: {
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29, 185, 84, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(29, 185, 84, 0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-80px)', opacity: '0' },
          '20%, 80%': { opacity: '1' },
          '100%': { transform: 'translateY(80px)', opacity: '0' },
        },
        waveIdle: {
          '0%, 100%': { transform: 'scaleY(0.65)' },
          '50%': { transform: 'scaleY(1.15)' },
        },
        waveLive: {
          from: { transform: 'scaleY(0.78)' },
          to: { transform: 'scaleY(1.22)' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(0.96)', opacity: '0.35' },
          '50%': { transform: 'scale(1.04)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
