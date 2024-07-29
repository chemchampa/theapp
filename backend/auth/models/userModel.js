const pool = require('../../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  async createUser(username, email, password, tenantId, organizationId) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO auth.users(username, email, password, tenant_id, organization_id) VALUES($1, $2, $3, $4, $5) RETURNING *';
    const values = [username, email, hashedPassword, tenantId, organizationId];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findUserByEmail(email, tenantId, organizationId) {
    const query = 'SELECT * FROM auth.users WHERE email = $1 AND tenant_id = $2 AND organization_id = $3';
    const result = await pool.query(query, [email, tenantId, organizationId]);
    return result.rows[0];
  },

  async findUserById(id, tenantId, organizationId) {
    const query = 'SELECT * FROM auth.users WHERE id = $1 AND tenant_id = $2 AND organization_id = $3';
    const result = await pool.query(query, [id, tenantId, organizationId]);
    return result.rows[0];
  }
};

module.exports = userModel;