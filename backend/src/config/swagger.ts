/**
 * Especificação OpenAPI 3 escrita em um único arquivo (em vez de comentários
 * JSDoc espalhados pelas rotas): funciona igual em dev (src/*.ts) e em
 * produção (dist/*.js) e dá pra ver a API inteira de uma vez.
 */
type Json = Record<string, unknown>;

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const ok = (schema: Json, description = 'OK') => ({
  description,
  content: {
    'application/json': {
      schema: { type: 'object', properties: { success: { type: 'boolean' }, data: schema } },
    },
  },
});
const list = (name: string) => ({ type: 'array', items: ref(name) });
const body = (schema: Json) => ({ required: true, content: { 'application/json': { schema } } });
const multipart = (properties: Json, required: string[] = []) => ({
  required: true,
  content: { 'multipart/form-data': { schema: { type: 'object', properties, required } } },
});
const idParam = (name = 'id') => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
});
const queryParam = (name: string) => ({
  name,
  in: 'query',
  required: true,
  schema: { type: 'string' },
});
const secured = [{ bearerAuth: [] }];
const errors = {
  '400': ref('Error'),
  '401': ref('Error'),
  '403': ref('Error'),
  '404': ref('Error'),
};
const file = { type: 'string', format: 'binary' };
const str = { type: 'string' };

const credentials = {
  type: 'object',
  required: ['email', 'password'],
  properties: { email: str, password: str },
};

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NOIZ API',
    version: '1.0.0',
    description:
      'API da plataforma de streaming de música NOIZ.\n\nPara testar rotas protegidas: faça login em `/auth/login`, copie o `accessToken` e clique em **Authorize**.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [
    'Auth',
    'Users',
    'Artists',
    'Albums',
    'Tracks',
    'Playlists',
    'Favorites',
    'History',
    'Search',
  ].map((name) => ({ name })),
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: {
        type: 'object',
        properties: { success: { type: 'boolean', example: false }, message: str },
      },
      User: {
        type: 'object',
        properties: {
          id: str,
          name: str,
          email: str,
          role: { type: 'string', enum: ['LISTENER', 'ARTIST', 'ADMIN'] },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
      Session: {
        type: 'object',
        properties: { user: ref('User'), accessToken: str, refreshToken: str },
      },
      Artist: {
        type: 'object',
        properties: {
          id: str,
          name: str,
          bio: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
          coverUrl: { type: 'string', nullable: true },
          verified: { type: 'boolean' },
        },
      },
      Album: {
        type: 'object',
        properties: {
          id: str,
          title: str,
          coverUrl: { type: 'string', nullable: true },
          type: { type: 'string', enum: ['ALBUM', 'SINGLE', 'EP'] },
          releaseDate: { type: 'string', format: 'date-time', nullable: true },
          artist: ref('Artist'),
        },
      },
      Track: {
        type: 'object',
        properties: {
          id: str,
          title: str,
          durationSec: { type: 'integer' },
          fileUrl: str,
          coverUrl: { type: 'string', nullable: true },
          genre: { type: 'string', nullable: true },
          playsCount: { type: 'integer' },
          artist: ref('Artist'),
          album: ref('Album'),
        },
      },
      Playlist: {
        type: 'object',
        properties: {
          id: str,
          name: str,
          description: { type: 'string', nullable: true },
          coverUrl: { type: 'string', nullable: true },
          isPublic: { type: 'boolean' },
          trackCount: { type: 'integer' },
          tracks: list('Track'),
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cria uma conta',
        requestBody: body({
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: str,
            email: str,
            password: { type: 'string', description: 'Mín. 8 caracteres, 1 maiúscula e 1 número' },
          },
        }),
        responses: { '201': ok(ref('Session')), '400': ref('Error'), '409': ref('Error') },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica e devolve access + refresh token',
        requestBody: body(credentials),
        responses: { '200': ok(ref('Session')), '401': ref('Error') },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Troca um refresh token por um novo par (rotação)',
        requestBody: body({
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: str },
        }),
        responses: { '200': ok(ref('Session')), '401': ref('Error') },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoga o refresh token',
        requestBody: body({
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: str },
        }),
        responses: { '204': { description: 'Sem conteúdo' } },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Envia e-mail de recuperação (resposta sempre igual)',
        requestBody: body({ type: 'object', required: ['email'], properties: { email: str } }),
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Define nova senha com o token do e-mail',
        requestBody: body({
          type: 'object',
          required: ['token', 'password'],
          properties: { token: str, password: str },
        }),
        responses: { '200': { description: 'OK' }, '400': ref('Error') },
      },
    },

    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Perfil do usuário logado',
        security: secured,
        responses: { '200': ok(ref('User')), '401': ref('Error') },
      },
      patch: {
        tags: ['Users'],
        summary: 'Atualiza o nome',
        security: secured,
        requestBody: body({ type: 'object', properties: { name: str } }),
        responses: { '200': ok(ref('User')) },
      },
    },
    '/users/me/avatar': {
      post: {
        tags: ['Users'],
        summary: 'Envia a foto de perfil',
        security: secured,
        requestBody: multipart({ image: file }, ['image']),
        responses: { '200': ok(ref('User')), ...errors },
      },
    },

    '/artists': {
      post: {
        tags: ['Artists'],
        summary: 'Cria o perfil de artista (promove o usuário a ARTIST e devolve nova sessão)',
        security: secured,
        requestBody: body({
          type: 'object',
          required: ['name'],
          properties: { name: str, bio: str },
        }),
        responses: {
          '201': ok({
            type: 'object',
            properties: {
              artist: ref('Artist'),
              user: ref('User'),
              accessToken: str,
              refreshToken: str,
            },
          }),
          '409': ref('Error'),
        },
      },
    },
    '/artists/search': {
      get: {
        tags: ['Artists'],
        summary: 'Busca artistas por nome',
        parameters: [queryParam('q')],
        responses: { '200': ok(list('Artist')) },
      },
    },
    '/artists/me': {
      get: {
        tags: ['Artists'],
        summary: 'Catálogo do próprio artista (álbuns e músicas)',
        security: secured,
        responses: { '200': ok(ref('Artist')), '404': ref('Error') },
      },
    },
    '/artists/me/avatar': {
      post: {
        tags: ['Artists'],
        summary: 'Foto do artista',
        security: secured,
        requestBody: multipart({ image: file }, ['image']),
        responses: { '200': ok(ref('Artist')) },
      },
    },
    '/artists/me/cover': {
      post: {
        tags: ['Artists'],
        summary: 'Capa do perfil do artista',
        security: secured,
        requestBody: multipart({ image: file }, ['image']),
        responses: { '200': ok(ref('Artist')) },
      },
    },
    '/artists/{id}': {
      get: {
        tags: ['Artists'],
        summary: 'Página do artista (álbuns + músicas mais tocadas)',
        parameters: [idParam()],
        responses: { '200': ok(ref('Artist')), '404': ref('Error') },
      },
    },

    '/albums': {
      post: {
        tags: ['Albums'],
        summary: 'Cria um álbum (ARTIST)',
        security: secured,
        requestBody: multipart(
          {
            title: str,
            type: { type: 'string', enum: ['ALBUM', 'SINGLE', 'EP'] },
            releaseDate: { type: 'string', format: 'date' },
            cover: file,
          },
          ['title'],
        ),
        responses: { '201': ok(ref('Album')), ...errors },
      },
    },
    '/albums/recent': {
      get: {
        tags: ['Albums'],
        summary: 'Álbuns mais recentes',
        responses: { '200': ok(list('Album')) },
      },
    },
    '/albums/{id}': {
      get: {
        tags: ['Albums'],
        summary: 'Página do álbum com as faixas',
        parameters: [idParam()],
        responses: { '200': ok(ref('Album')), '404': ref('Error') },
      },
      delete: {
        tags: ['Albums'],
        summary: 'Exclui um álbum próprio (as músicas viram singles)',
        security: secured,
        parameters: [idParam()],
        responses: { '204': { description: 'Sem conteúdo' }, '403': ref('Error') },
      },
    },

    '/tracks': {
      post: {
        tags: ['Tracks'],
        summary: 'Envia uma música (ARTIST)',
        security: secured,
        requestBody: multipart(
          {
            audio: file,
            cover: file,
            title: str,
            durationSec: { type: 'integer' },
            albumId: str,
            genre: str,
          },
          ['audio', 'title', 'durationSec'],
        ),
        responses: { '201': ok(ref('Track')), ...errors },
      },
    },
    '/tracks/search': {
      get: {
        tags: ['Tracks'],
        summary: 'Busca músicas por título',
        parameters: [queryParam('q')],
        responses: { '200': ok(list('Track')) },
      },
    },
    '/tracks/trending': {
      get: {
        tags: ['Tracks'],
        summary: 'Músicas mais tocadas',
        responses: { '200': ok(list('Track')) },
      },
    },
    '/tracks/{id}': {
      get: {
        tags: ['Tracks'],
        summary: 'Detalhe de uma música',
        parameters: [idParam()],
        responses: { '200': ok(ref('Track')), '404': ref('Error') },
      },
      patch: {
        tags: ['Tracks'],
        summary: 'Edita uma música própria',
        security: secured,
        parameters: [idParam()],
        requestBody: body({ type: 'object', properties: { title: str, genre: str, albumId: str } }),
        responses: { '200': ok(ref('Track')), '403': ref('Error') },
      },
      delete: {
        tags: ['Tracks'],
        summary: 'Exclui uma música própria (e os arquivos)',
        security: secured,
        parameters: [idParam()],
        responses: { '204': { description: 'Sem conteúdo' }, '403': ref('Error') },
      },
    },

    '/playlists': {
      get: {
        tags: ['Playlists'],
        summary: 'Minhas playlists',
        security: secured,
        responses: { '200': ok(list('Playlist')) },
      },
      post: {
        tags: ['Playlists'],
        summary: 'Cria uma playlist',
        security: secured,
        requestBody: body({
          type: 'object',
          required: ['name'],
          properties: { name: str, description: str, isPublic: { type: 'boolean' } },
        }),
        responses: { '201': ok(ref('Playlist')) },
      },
    },
    '/playlists/{id}': {
      get: {
        tags: ['Playlists'],
        summary: 'Detalhe da playlist (privada: só a dona)',
        security: secured,
        parameters: [idParam()],
        responses: { '200': ok(ref('Playlist')), '404': ref('Error') },
      },
      patch: {
        tags: ['Playlists'],
        summary: 'Edita nome/descrição/visibilidade',
        security: secured,
        parameters: [idParam()],
        requestBody: body({
          type: 'object',
          properties: { name: str, description: str, isPublic: { type: 'boolean' } },
        }),
        responses: { '200': ok(ref('Playlist')), '403': ref('Error') },
      },
      delete: {
        tags: ['Playlists'],
        summary: 'Exclui a playlist',
        security: secured,
        parameters: [idParam()],
        responses: { '204': { description: 'Sem conteúdo' }, '403': ref('Error') },
      },
    },
    '/playlists/{id}/cover': {
      post: {
        tags: ['Playlists'],
        summary: 'Capa da playlist',
        security: secured,
        parameters: [idParam()],
        requestBody: multipart({ cover: file }, ['cover']),
        responses: { '200': ok(ref('Playlist')) },
      },
    },
    '/playlists/{id}/tracks': {
      post: {
        tags: ['Playlists'],
        summary: 'Adiciona uma música',
        security: secured,
        parameters: [idParam()],
        requestBody: body({ type: 'object', required: ['trackId'], properties: { trackId: str } }),
        responses: { '201': { description: 'Adicionada' }, '409': ref('Error') },
      },
    },
    '/playlists/{id}/tracks/{trackId}': {
      delete: {
        tags: ['Playlists'],
        summary: 'Remove uma música',
        security: secured,
        parameters: [idParam(), idParam('trackId')],
        responses: { '204': { description: 'Sem conteúdo' } },
      },
    },

    '/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Músicas curtidas',
        security: secured,
        responses: { '200': ok(list('Track')) },
      },
    },
    '/favorites/{trackId}/toggle': {
      post: {
        tags: ['Favorites'],
        summary: 'Curte/descurte uma música',
        security: secured,
        parameters: [idParam('trackId')],
        responses: {
          '200': ok({ type: 'object', properties: { favorited: { type: 'boolean' } } }),
        },
      },
    },

    '/history': {
      get: {
        tags: ['History'],
        summary: 'Tocadas recentemente (sem repetição)',
        security: secured,
        responses: { '200': ok(list('Track')) },
      },
      post: {
        tags: ['History'],
        summary: 'Registra uma reprodução (e incrementa o contador da música)',
        security: secured,
        requestBody: body({ type: 'object', required: ['trackId'], properties: { trackId: str } }),
        responses: { '201': { description: 'Registrado' } },
      },
    },

    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Busca unificada por músicas, álbuns e artistas',
        parameters: [queryParam('q')],
        responses: {
          '200': ok({
            type: 'object',
            properties: { tracks: list('Track'), albums: list('Album'), artists: list('Artist') },
          }),
        },
      },
    },
  },
};
