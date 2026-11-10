import type { Config } from 'tailwindcss';

/**
 * Identidade visual da NOIZ: alto contraste, fundo quase-preto e um
 * verde-limão neon como cor de destaque (cultura de rua / "corre"),
 * sem copiar o verde do Spotify — o nosso puxa pro amarelo.
 *
 * As cores vêm de CSS variables (src/styles/index.css). Assim o tema
 * claro/escuro troca só os valores das variáveis e TODOS os componentes
 * se adaptam sozinhos, sem `dark:` espalhado pelo código.
 * O `<alpha-value>` mantém funcionando utilitários como `bg-fg/10`.
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: withAlpha('--c-base'),
        surface: withAlpha('--c-surface'),
        fg: withAlpha('--c-fg'),
        muted: withAlpha('--c-muted'),
        accent: {
          DEFAULT: withAlpha('--c-accent'),
          hover: withAlpha('--c-accent-hover'),
        },
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
