/**
 * JWT Authentication Middleware for KNOT backend.
 * Provides requireAuth, requireAdmin, requireWorker, requireCitizen helpers.
 */

const { verifyToken } = require('../utils/jwt');

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches decoded `req.user` on success, or responds 401.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  const { valid, payload, error } = verifyToken(token);

  if (!valid) {
    return res.status(401).json({ error: `Unauthorized: ${error}` });
  }

  req.user = payload;
  next();
}

/**
 * Requires authenticated user with role "admin".
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
}

/**
 * Requires authenticated user with role "worker".
 */
function requireWorker(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Forbidden: Worker access required' });
    }
    next();
  });
}

/**
 * Requires authenticated user with role "citizen".
 */
function requireCitizen(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ error: 'Forbidden: Citizen access required' });
    }
    next();
  });
}

/**
 * Requires authenticated user with role "worker" OR "citizen".
 */
function requireUser(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'worker' && req.user.role !== 'citizen') {
      return res.status(403).json({ error: 'Forbidden: Authenticated user required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requireWorker, requireCitizen, requireUser };
