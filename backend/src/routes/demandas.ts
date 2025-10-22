import { Router } from 'express';
import { DemandasController } from '../controllers/demandasController.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/demandas - Listar demandas
router.get('/', asyncHandler(DemandasController.listar));

// GET /api/demandas/:id - Buscar demanda específica
router.get('/:id', asyncHandler(DemandasController.buscar));

// POST /api/demandas - Criar demanda (apenas gerentes/admins)
router.post('/', requireManager, asyncHandler(DemandasController.criar));

// PUT /api/demandas/:id - Atualizar demanda (apenas gerentes/admins)
router.put('/:id', requireManager, asyncHandler(DemandasController.atualizar));

// DELETE /api/demandas/:id - Deletar demanda (apenas gerentes/admins)
router.delete('/:id', requireManager, asyncHandler(DemandasController.deletar));

export default router;


