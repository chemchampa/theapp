const pool = require('../config/db');

const setTenantAndOrganization = async (req, res, next) => {
  console.log('setTenantAndOrganization middleware - req.user:', req.user);
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await pool.query('SELECT tenant_id, organization_id FROM auth.users WHERE id = $1', [req.user.id]);
    if (result.rows.length > 0) {
      req.tenantId = result.rows[0].tenant_id;
      req.organizationId = result.rows[0].organization_id;
      console.log('setTenantAndOrganization middleware - set values:', { tenantId: req.tenantId, organizationId: req.organizationId });
      next();
    } else {
      res.status(403).json({ message: 'Tenant or organization not found' });
    }
  } catch (error) {
    console.error('Error setting tenant and organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { setTenantAndOrganization };
