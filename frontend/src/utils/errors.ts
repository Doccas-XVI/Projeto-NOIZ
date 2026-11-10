import { isAxiosError } from 'axios';

/**
 * Extrai uma mensagem amigável de qualquer erro. A API sempre responde
 * { success: false, message } — então mostramos exatamente o que ela disse
 * (ex: "Esta música já está na playlist") em vez de um genérico "deu erro".
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Algo deu errado. Tente novamente.',
): string {
  if (isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (apiMessage) return apiMessage;
    if (error.code === 'ERR_NETWORK') return 'Não consegui falar com o servidor. Ele está rodando?';
  }
  return fallback;
}
