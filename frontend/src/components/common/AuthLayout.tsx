import type { ReactNode } from 'react';
import logo from '@/assets/logo.svg';

export const inputClass =
  'w-full rounded-lg bg-base px-4 py-3 text-sm outline-none ring-1 ring-fg/15 placeholder:text-muted focus:ring-accent';

export const primaryButtonClass =
  'rounded-full bg-accent px-6 py-3 text-sm font-bold text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60';

/** Casca visual das telas de login, cadastro e recuperação de senha. */
export function AuthLayout({ subtitle, children }: { subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-xl">
        <img
          src={logo}
          alt="NOIZ"
          className="mb-2 h-8"
          style={{ filter: 'var(--logo-filter, none)' }}
        />
        <p className="mb-6 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  ) : null;
}
