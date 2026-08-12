/**
 * Erro de aplicação com status HTTP embutido.
 * Services e controllers lançam (throw) este erro; o middleware
 * de erro centralizado é o único lugar que sabe transformar isso
 * em uma resposta JSON.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // erro esperado (regra de negócio), não um bug
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }
  static unauthorized(message = 'Não autenticado') {
    return new AppError(message, 401);
  }
  static forbidden(message = 'Acesso não permitido') {
    return new AppError(message, 403);
  }
  static notFound(message = 'Recurso não encontrado') {
    return new AppError(message, 404);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
}
