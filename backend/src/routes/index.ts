import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { artistRoutes } from './artist.routes';
import { albumRoutes } from './album.routes';
import { trackRoutes } from './track.routes';
import { playlistRoutes } from './playlist.routes';
import { favoriteRoutes } from './favorite.routes';
import { historyRoutes } from './history.routes';
import { searchRoutes } from './search.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/artists', artistRoutes);
router.use('/albums', albumRoutes);
router.use('/tracks', trackRoutes);
router.use('/playlists', playlistRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'noiz-api' }));
