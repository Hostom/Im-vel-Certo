import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import type { JWTPayload, AppRole } from '../types/index.js';

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Middleware para verificar autenticação
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  try {
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido ou expirado' });
    return;
  }
}

// Middleware para verificar roles específicas
export function requireRole(...roles: AppRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    try {
      const hasPermission = await AuthService.hasAnyRole(req.user.userId, roles);
      
      if (!hasPermission) {
        res.status(403).json({ 
          error: 'Permissão negada',
          required_roles: roles,
          user_role: req.user.tipo
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar permissões' });
      return;
    }
  };
}

// Middleware para verificar se é admin ou diretor
export const requireAdmin = requireRole('admin', 'diretor');

// Middleware para verificar se é gerente, admin ou diretor
export const requireManager = requireRole('gerente_regional', 'admin', 'diretor');


