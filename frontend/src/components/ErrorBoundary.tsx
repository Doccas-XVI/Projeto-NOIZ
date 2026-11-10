import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

/**
 * Rede de segurança: se qualquer componente quebrar na renderização,
 * mostra uma tela de recuperação em vez de uma página em branco.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro de renderização:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base px-6 text-center text-fg">
        <h1 className="text-2xl font-black">Opa, algo quebrou por aqui.</h1>
        <p className="max-w-sm text-sm text-muted">
          Isso não era pra acontecer. Recarregue a página para continuar ouvindo.
        </p>
        <button
          onClick={() => window.location.assign('/')}
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover"
        >
          Voltar ao início
        </button>
      </div>
    );
  }
}
