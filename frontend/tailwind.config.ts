import type { Config } from 'tailwindcss';

/**
 * Identidade visual da NOIZ: alto contraste (preferência do usuário),
 * fundo quase-preto, um verde-limão vibrante como cor de destaque
 * (referência à cultura de rua/corre, mas sem copiar o verde do Spotify
 * — o nosso é mais "neon", puxado pro amarelo).
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0B0B0D', // fundo dark
          light: '#F5F5F7',   // fundo light
        },
        surface: {
          DEFAULT: '#171719',
          light: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#D6FF3F', // verde-limão neon — identidade própria
          hover: '#c2eb2c',
        },
        muted: '#8A8A93',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
