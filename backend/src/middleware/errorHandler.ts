import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

// Middleware global de tratamento de erros
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('❌ Erro:', err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  // Erros específicos do PostgreSQL
  if (err.code === '23505') {
    res.status(409).json({ 
      error: 'Registro duplicado',
      detail: 'Este registro já existe no banco de dados'
    });
    return;
  }

  if (err.code === '23503') {
    res.status(400).json({ 
      error: 'Referência inválida',
      detail: 'O registro referenciado não existe'
    });
    return;
  }

  if (err.code === '23502') {
    res.status(400).json({ 
      error: 'Campo obrigatório',
      detail: 'Um campo obrigatório não foi fornecido'
    });
    return;
  }

  // Erro padrão
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Wrapper para funções async (evita try-catch em cada rota)
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}


