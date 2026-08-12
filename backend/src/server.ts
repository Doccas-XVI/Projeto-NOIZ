import { app } from '@/app';
import { env } from '@/config/env';

app.listen(env.PORT, () => {
  console.log(`🎧 NOIZ API rodando em http://localhost:${env.PORT}`);
  console.log(`📄 Docs disponíveis em http://localhost:${env.PORT}/docs`);
});
