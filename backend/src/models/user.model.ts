import type { User } from '@prisma/client';

/**
 * Representação pública de um usuário: nunca devolvemos hash de senha,
 * token de reset etc. para o cliente. Todo service que retorna usuário
 * passa por este mapper — um único lugar decide o que é "seguro expor".
 */
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role' | 'avatarUrl' | 'createdAt'>;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}
