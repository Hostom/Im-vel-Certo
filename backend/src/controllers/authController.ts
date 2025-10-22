import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { z } from 'zod';

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo: z.enum(['captador', 'gerente_regional', 'admin', 'diretor']).optional(),
  regiao: z.string().optional(),
});

export class AuthController {
  // POST /api/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = loginSchema.parse(req.body);

      const result = await AuthService.login(email, senha);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
        return;
      }

      res.status(401).json({ error: error.message });
    }
  }

  // POST /api/auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);

      const usuario = await AuthService.register(
        data.nome,
        data.email,
        data.senha,
        data.tipo,
        data.regiao
      );

      res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
        return;
      }

      res.status(400).json({ error: error.message });
    }
  }

  // POST /api/auth/logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        await AuthService.logout(token);
      }

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/auth/me
  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const usuario = await AuthService.getUserById(req.user.userId);

      if (!usuario) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}


