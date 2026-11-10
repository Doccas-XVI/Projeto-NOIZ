import { Router } from 'express';
import { searchController } from '@/controllers/search.controller';

export const searchRoutes = Router();

searchRoutes.get('/', searchController.search);
