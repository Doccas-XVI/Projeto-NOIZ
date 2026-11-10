import rateLimit from 'express-rate-limit';

/** Limite geral da API (por IP). */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

/**
 * Limite mais apertado para rotas sensíveis (login, cadastro, esqueci a senha):
 * reduz a eficácia de ataques de força bruta contra senhas.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  },
});
