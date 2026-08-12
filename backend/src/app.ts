import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from '@/config/env';
import { router } from '@/routes';
import { errorMiddleware, notFoundMiddleware } from '@/middlewares/error.middleware';
import { swaggerSpec } from '@/config/swagger';

export const app = express();

// Segurança: cabeçalhos HTTP mais seguros por padrão (mitiga XSS, sniffing, etc.)
app.use(helmet());

// CORS restrito ao domínio do frontend (evita que qualquer site chame a API com credenciais)
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Limita requisições por IP — mitigação básica de brute-force / DoS
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1', router);

app.use(notFoundMiddleware);
app.use(errorMiddleware); // sempre o último
