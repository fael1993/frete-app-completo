// ============================================
// Error Handler Middleware
// ============================================

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflito',
      message: 'Já existe um registo com estes dados.',
      field: err.meta?.target,
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Não encontrado',
      message: 'Registo não encontrado.',
    });
  }
  
  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: err.message,
      details: err.errors,
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Por favor, faça login novamente.',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'A sua sessão expirou. Por favor, faça login novamente.',
    });
  }
  
  // Erro genérico
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware para rotas não encontradas
 */
export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
  });
};
