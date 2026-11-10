import clsx from 'clsx';

interface CoverProps {
  src?: string | null;
  title: string;
  className?: string;
  /** artistas e avatares usam capa redonda */
  round?: boolean;
}

/** Gera sempre o mesmo gradiente para o mesmo texto (capa "padrão" com personalidade). */
function gradientFor(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return `linear-gradient(135deg, hsl(${hash} 70% 45%), hsl(${(hash + 60) % 360} 70% 28%))`;
}

/**
 * Capa de música/álbum/playlist/artista. Sem imagem (ou se ela falhar ao
 * carregar), mostra um gradiente único com a inicial — em vez do "esqueleto
 * piscando pra sempre" que parecia um carregamento travado.
 */
export function Cover({ src, title, className, round }: CoverProps) {
  const radius = round ? 'rounded-full' : 'rounded-lg';

  if (src) {
    return (
      <img
        src={src}
        alt={title}
        loading="lazy"
        className={clsx('aspect-square object-cover', radius, className)}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={clsx(
        'grid aspect-square place-items-center font-black text-white/90',
        radius,
        className,
      )}
      // containerType + unidade `cqw`: a letra cresce proporcionalmente à largura da capa
      style={{ background: gradientFor(title), containerType: 'inline-size' }}
    >
      <span style={{ fontSize: 'clamp(0.75rem, 40cqw, 3rem)' }}>
        {title.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
