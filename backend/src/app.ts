import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from '@/config/env';
import { router } from '@/routes';
import { errorMiddleware, notFoundMiddleware } from '@/middlewares/error.middleware';
import { apiLimiter } from '@/middlewares/rateLimit.middleware';
import { swaggerSpec } from '@/config/swagger';

export const app = express();

// Atrás de proxy (Railway/Render/Docker) o IP real vem em X-Forwarded-For;
// sem isso o rate limit enxergaria todo mundo como o mesmo IP do proxy.
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Segurança: cabeçalhos HTTP mais seguros por padrão (mitiga XSS, sniffing, etc.)
app.use(helmet());

// CORS restrito ao domínio do frontend (evita que qualquer site chame a API com credenciais)
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

app.use(apiLimiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1', router);

app.use(notFoundMiddleware);
app.use(errorMiddleware); // sempre o último
