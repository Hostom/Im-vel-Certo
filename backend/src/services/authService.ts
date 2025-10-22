import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import type { Usuario, UsuarioSemSenha, JWTPayload, LoginResponse } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-MUDE-ISSO';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  // Login de usuário
  static async login(email: string, senha: string): Promise<LoginResponse> {
    // Buscar usuário pelo email
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Email ou senha inválidos');
    }

    const usuario: Usuario = result.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar JWT token
    const payload: JWTPayload = {
      userId: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Remover senha_hash do objeto
    const { senha_hash, ...usuarioSemSenha } = usuario;

    // Salvar sessão no banco (opcional, para rastreamento)
    await query(
      `INSERT INTO sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [usuario.id, this.hashToken(token)]
    );

    return {
      token,
      user: usuarioSemSenha as UsuarioSemSenha,
    };
  }

  // Registro de novo usuário
  static async register(
    nome: string,
    email: string,
    senha: string,
    tipo: string = 'captador',
    regiao: string = 'Geral'
  ): Promise<UsuarioSemSenha> {
    // Verificar se email já existe
    const existente = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existente.rows.length > 0) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = await query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo, regiao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, tipo, regiao, ativo, created_at, updated_at`,
      [nome, email, senha_hash, tipo, regiao]
    );

    const novoUsuario = result.rows[0];

    // Adicionar role padrão
    await query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [novoUsuario.id, tipo]
    );

    return novoUsuario;
  }

  // Verificar e decodificar token JWT
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  // Logout (invalidar token)
  static async logout(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    
    await query(
      'DELETE FROM sessions WHERE token_hash = $1',
      [tokenHash]
    );
  }

  // Buscar usuário por ID
  static async getUserById(userId: string): Promise<UsuarioSemSenha | null> {
    const result = await query(
      `SELECT id, nome, email, tipo, regiao, regioes_responsavel, 
              gerente_responsavel_id, ativo, created_at, updated_at
       FROM usuarios 
       WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  // Hash simples do token para armazenar no banco
  private static hashToken(token: string): string {
    return require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  // Verificar se usuário tem permissão
  static async hasRole(userId: string, role: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM usuarios WHERE id = $1 AND tipo = $2
       UNION
       SELECT 1 FROM user_roles WHERE user_id = $1 AND role = $2`,
      [userId, role]
    );

    return result.rows.length > 0;
  }

  // Verificar se usuário tem uma das roles
  static async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM usuarios WHERE id = $1 AND tipo = ANY($2)
       UNION
       SELECT 1 FROM user_roles WHERE user_id = $1 AND role = ANY($2)`,
      [userId, roles]
    );

    return result.rows.length > 0;
  }
}


