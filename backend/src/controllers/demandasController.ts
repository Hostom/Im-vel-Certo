import { Request, Response } from 'express';
import { query } from '../config/database.js';
import { z } from 'zod';

// Schema de validação
const demandaSchema = z.object({
  codigo_demanda: z.string().min(1, 'Código da demanda é obrigatório'),
  consultor_locacao: z.string().min(1, 'Consultor de locação é obrigatório'),
  cliente_interessado: z.string().min(1, 'Cliente interessado é obrigatório'),
  contato: z.string().min(1, 'Contato é obrigatório'),
  tipo_imovel: z.string().min(1, 'Tipo de imóvel é obrigatório'),
  regiao_desejada: z.string().min(1, 'Região desejada é obrigatória'),
  regiao_demanda: z.string().default('Geral'),
  faixa_aluguel: z.string().min(1, 'Faixa de aluguel é obrigatória'),
  valor_aluguel_min: z.number().optional(),
  valor_aluguel_max: z.number().optional(),
  caracteristicas_desejadas: z.string().optional(),
  prazo_necessidade: z.string().min(1, 'Prazo de necessidade é obrigatório'),
  observacoes: z.string().optional(),
  status: z.enum(['pendente', 'em_captacao', 'concluida', 'cancelada']).optional(),
});

export class DemandasController {
  // GET /api/demandas
  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const { status, regiao, limit = '50', offset = '0' } = req.query;

      let queryText = `
        SELECT d.*, u.nome as criado_por_nome
        FROM demandas d
        LEFT JOIN usuarios u ON d.criado_por_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      // Filtrar por status
      if (status) {
        queryText += ` AND d.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      // Filtrar por região
      if (regiao) {
        queryText += ` AND d.regiao_demanda = $${paramIndex}`;
        params.push(regiao);
        paramIndex++;
      }

      queryText += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Contar total
      let countQuery = 'SELECT COUNT(*) FROM demandas WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (status) {
        countQuery += ` AND status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }

      if (regiao) {
        countQuery += ` AND regiao_demanda = $${countParamIndex}`;
        countParams.push(regiao);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
        meta: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/demandas/:id
  static async buscar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT d.*, u.nome as criado_por_nome
         FROM demandas d
         LEFT JOIN usuarios u ON d.criado_por_id = u.id
         WHERE d.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Demanda não encontrada' });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/demandas
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      const data = demandaSchema.parse(req.body);

      const result = await query(
        `INSERT INTO demandas (
          codigo_demanda, consultor_locacao, cliente_interessado, contato,
          tipo_imovel, regiao_desejada, regiao_demanda, faixa_aluguel,
          valor_aluguel_min, valor_aluguel_max, caracteristicas_desejadas,
          prazo_necessidade, observacoes, status, criado_por_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          data.codigo_demanda,
          data.consultor_locacao,
          data.cliente_interessado,
          data.contato,
          data.tipo_imovel,
          data.regiao_desejada,
          data.regiao_demanda,
          data.faixa_aluguel,
          data.valor_aluguel_min,
          data.valor_aluguel_max,
          data.caracteristicas_desejadas,
          data.prazo_necessidade,
          data.observacoes,
          data.status || 'pendente',
          req.user?.userId,
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Demanda criada com sucesso',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
        return;
      }

      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/demandas/:id
  static async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = demandaSchema.partial().parse(req.body);

      // Construir query dinamicamente
      const campos = Object.keys(data);
      if (campos.length === 0) {
        res.status(400).json({ error: 'Nenhum campo para atualizar' });
        return;
      }

      const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
      const valores = campos.map((campo) => (data as any)[campo]);

      const result = await query(
        `UPDATE demandas SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...valores]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Demanda não encontrada' });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Demanda atualizada com sucesso',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
        return;
      }

      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/demandas/:id
  static async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM demandas WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Demanda não encontrada' });
        return;
      }

      res.json({
        success: true,
        message: 'Demanda deletada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}


