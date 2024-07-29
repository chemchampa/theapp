const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

const authMiddleware = {
  async protect(req, res, next) {
    console.log('Protect middleware called');
    console.log('Headers:', req.headers);

    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded);
      const user = await pool.query('SELECT id, email, role, tenant_id, organization_id FROM auth.users WHERE id = $1', [decoded.userId]);

      if (user.rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user.rows[0];
      req.user.role = user.rows[0].role;
      req.tenantId = user.rows[0].tenant_id;
      req.organizationId = user.rows[0].organization_id;

      console.log('User in authMiddleware:', req.user);

      // Check if tenant_id and organization_id are set
      if (!req.tenantId || !req.organizationId) {
        return res.status(403).json({ message: 'Organization not set', needsOrganization: true });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  },

  checkRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized, insufficient role' });
      }
      next();
    };
  }
};

module.exports = authMiddleware;
