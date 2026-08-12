import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export interface AccessTokenPayload {
  sub: string; // id do usuário
  role: 'LISTENER' | 'ARTIST' | 'ADMIN';
}

/**
 * Access token: vida curta (15min), vai em toda requisição no header
 * Authorization. Refresh token: vida longa (7 dias), guardado com hash
 * no banco (tabela refresh_tokens) e usado só para emitir um novo par.
 * Essa separação limita o estrago se um access token for roubado.
 */
// O @types/jsonwebtoken tipa `expiresIn` como um literal (ex: "15m"), não
// como `string` genérica. Como validamos o formato no env.ts com Zod,
// o cast aqui é seguro — o valor real já é garantido no formato certo.
export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessTokenPayload;
