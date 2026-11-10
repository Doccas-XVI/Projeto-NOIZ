import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/repositories/playlist.repository', () => ({
  playlistRepository: {
    findById: vi.fn(),
    belongsToUser: vi.fn(),
    hasTrack: vi.fn(),
    addTrack: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('@/utils/storage', () => ({ uploadToStorage: vi.fn(), deleteFromStorage: vi.fn() }));

import { playlistService } from '@/services/playlist.service';
import { playlistRepository } from '@/repositories/playlist.repository';

const repo = vi.mocked(playlistRepository);
beforeEach(() => vi.clearAllMocks());

const playlist = (overrides = {}) =>
  ({
    id: 'p1',
    name: 'Corre',
    description: null,
    coverUrl: null,
    isPublic: true,
    userId: 'dona',
    createdAt: new Date(),
    updatedAt: new Date(),
    tracks: [
      { position: 1, track: { id: 't2', title: 'B' } },
      { position: 0, track: { id: 't1', title: 'A' } },
    ],
    ...overrides,
  }) as never;

describe('playlistService.getById', () => {
  it('devolve as músicas achatadas (Track[]), não a tabela de junção', async () => {
    repo.findById.mockResolvedValue(playlist());
    const result = await playlistService.getById('p1', 'dona');
    expect(result.tracks.map((t) => t.id)).toEqual(['t2', 't1']);
    expect(result.trackCount).toBe(2);
  });

  it('playlist privada: outro usuário recebe 404 (não revela que existe)', async () => {
    repo.findById.mockResolvedValue(playlist({ isPublic: false }));
    await expect(playlistService.getById('p1', 'intruso')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('playlist privada: a dona consegue ver', async () => {
    repo.findById.mockResolvedValue(playlist({ isPublic: false }));
    await expect(playlistService.getById('p1', 'dona')).resolves.toBeTruthy();
  });
});

describe('permissões de edição', () => {
  it('quem não é dona não edita, não exclui e não adiciona músicas (403)', async () => {
    repo.belongsToUser.mockResolvedValue(null);
    await expect(playlistService.update('intruso', 'p1', { name: 'x' })).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(playlistService.delete('intruso', 'p1')).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(playlistService.addTrack('intruso', 'p1', 't1')).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('não permite a mesma música duas vezes na playlist (409)', async () => {
    repo.belongsToUser.mockResolvedValue({ id: 'p1' } as never);
    repo.hasTrack.mockResolvedValue({ id: 'x' } as never);
    await expect(playlistService.addTrack('dona', 'p1', 't1')).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(repo.addTrack).not.toHaveBeenCalled();
  });
});
