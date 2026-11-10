import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Áudios de demonstração públicos (SoundHelix) para o player tocar de verdade
// em desenvolvimento, mesmo sem Supabase configurado.
const demoAudio = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const demoCover = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

async function main() {
  const passwordHash = await bcrypt.hash('Senha123', 12);

  const listener = await prisma.user.upsert({
    where: { email: 'ouvinte@noiz.app' },
    update: {},
    create: { name: 'Ouvinte Teste', email: 'ouvinte@noiz.app', passwordHash },
  });

  const artistUser = await prisma.user.upsert({
    where: { email: 'artista@noiz.app' },
    update: {},
    create: { name: 'Artista Teste', email: 'artista@noiz.app', passwordHash, role: 'ARTIST' },
  });

  const artist = await prisma.artist.upsert({
    where: { userId: artistUser.id },
    update: {},
    create: {
      name: 'MC Corre',
      bio: 'Direto da quebrada pro streaming.',
      verified: true,
      userId: artistUser.id,
      avatarUrl: demoCover('mc-corre'),
    },
  });

  const albums = [
    {
      title: 'Primeiro Corre',
      type: 'ALBUM' as const,
      cover: demoCover('primeiro-corre'),
      tracks: [
        { title: 'Sobe o Som', durationSec: 372, audio: 1, genre: 'Hip-Hop' },
        { title: 'Na Pista', durationSec: 425, audio: 2, genre: 'Hip-Hop' },
        { title: 'Madrugada', durationSec: 344, audio: 3, genre: 'Trap' },
      ],
    },
    {
      title: 'Noite Longa',
      type: 'EP' as const,
      cover: demoCover('noite-longa'),
      tracks: [
        { title: 'Luz da Rua', durationSec: 305, audio: 4, genre: 'R&B' },
        { title: 'Fim de Turno', durationSec: 360, audio: 5, genre: 'R&B' },
      ],
    },
  ];

  for (const data of albums) {
    // Idempotente: rodar o seed várias vezes não duplica álbuns nem músicas.
    const existing = await prisma.album.findFirst({
      where: { title: data.title, artistId: artist.id },
    });
    if (existing) continue;

    await prisma.album.create({
      data: {
        title: data.title,
        type: data.type,
        coverUrl: data.cover,
        releaseDate: new Date(),
        artistId: artist.id,
        tracks: {
          create: data.tracks.map((t) => ({
            title: t.title,
            durationSec: t.durationSec,
            genre: t.genre,
            fileUrl: demoAudio(t.audio),
            artistId: artist.id,
          })),
        },
      },
    });
  }

  console.log('✅ Seed concluído:', {
    ouvinte: listener.email,
    artista: artistUser.email,
    senha: 'Senha123',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
