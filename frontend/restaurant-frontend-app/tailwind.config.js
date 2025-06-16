/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '48px', fontWeight: '500' }],
        h2: ['24px', { lineHeight: '40px', fontWeight: '500' }],
        h3: ['18px', { lineHeight: '32px', fontWeight: '500' }],
        'block-title': ['14px', { lineHeight: '24px', fontWeight: '300' }],
        'body-bold': ['14px', { lineHeight: '24px', fontWeight: '500' }],
        body: ['14px', { lineHeight: '24px', fontWeight: '300' }],
        'button-primary': ['14px', { lineHeight: '24px', fontWeight: '700' }],
        'button-secondary': ['14px', { lineHeight: '24px', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '300' }],
        link: ['12px', { lineHeight: '16px', fontWeight: '700' }],
        navigation: ['20px', { lineHeight: '32px', fontWeight: '500' }],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700,
      },
      colors: {
        neutral: {
          0: '#FFFFFF',
          100: '#F7F7F7',
          200: '#DADADA',
          400: '#898989',
          600: '#575757',
          900: '#232323',
        },
        green: {
          100: '#E9FFEA',
          200: '#00AD0C',
          300: '#008209',
          400: '#006907',
        },
        blue: {
          100: '#DEE9FF',
          400: '#0E53E9',
        },
        orange: {
          100: '#FFF2D4',
          400: '#FFAE00',
        },
        red: {
          100: '#FCE9ED',
          400: '#D70B0B',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
