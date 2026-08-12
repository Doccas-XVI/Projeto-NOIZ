import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
    create: {
      name: 'Artista Teste',
      email: 'artista@noiz.app',
      passwordHash,
      role: 'ARTIST',
    },
  });

  const artist = await prisma.artist.upsert({
    where: { userId: artistUser.id },
    update: {},
    create: { name: 'MC Corre', bio: 'Direto da quebrada pro streaming.', userId: artistUser.id },
  });

  const album = await prisma.album.create({
    data: {
      title: 'Primeiro Corre',
      type: 'ALBUM',
      artistId: artist.id,
      tracks: {
        create: [
          { title: 'Sobe o Som', durationSec: 187, fileUrl: 'https://example.com/track1.mp3', artistId: artist.id },
          { title: 'Na Pista', durationSec: 201, fileUrl: 'https://example.com/track2.mp3', artistId: artist.id },
        ],
      },
    },
  });

  console.log('✅ Seed concluído:', { listener: listener.email, artist: artist.name, album: album.title });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
