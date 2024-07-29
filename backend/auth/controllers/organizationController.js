const pool = require('../../config/db');

const organizationController = {
  async getOrganizations(req, res) {
    try {
      const result = await pool.query('SELECT id, name FROM auth.organizations');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ message: 'Error fetching organizations' });
    }
  },

  async createOrganization(req, res) {
    const { name, tenantId } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO auth.organizations (name, tenant_id) VALUES ($1, $2) RETURNING id, name',
        [name, tenantId]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ message: 'Error creating organization' });
    }
  },

  async setUserOrganization(req, res) {
    const { userId, organizationId, tenantId } = req.body;
    try {
      await pool.query(
        'UPDATE auth.users SET organization_id = $1, tenant_id = $2 WHERE id = $3',
        [organizationId, tenantId, userId]
      );
      res.json({ message: 'Organization set successfully' });
    } catch (error) {
      console.error('Error setting user organization:', error);
      res.status(500).json({ message: 'Error setting user organization' });
    }
  }
};

module.exports = organizationController;
