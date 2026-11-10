// Variáveis mínimas para o env.ts validar durante os testes (nada de rede/banco real).
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_123456';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_123456';
