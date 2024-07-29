const pool = require('../config/db');

const adminController = {
  async getUsers(req, res) {
    try {
      const result = await pool.query('SELECT * FROM auth.users');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  },

  async getOrganizations(req, res) {
    try {
      const result = await pool.query('SELECT * FROM auth.organizations');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching organizations', error: error.message });
    }
  },

  async getSpreadsheets(req, res) {
    try {
      const result = await pool.query('SELECT * FROM auth.spreadsheet_mappings');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching spreadsheets', error: error.message });
    }
  },

  async assignSpreadsheet(req, res) {
    const { organizationId, spreadsheetType, spreadsheetId } = req.body;
    try {
      await pool.query(
        'UPDATE auth.spreadsheet_mappings SET spreadsheet_id = $1 WHERE organization_id = $2 AND spreadsheet_type = $3',
        [spreadsheetId, organizationId, spreadsheetType]
      );
      res.json({ message: 'Spreadsheet assigned successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error assigning spreadsheet', error: error.message });
    }
  },

  async updateUserRole(req, res) {
    const { userId } = req.params;
    const { role } = req.body;
    try {
      await pool.query('UPDATE auth.users SET role = $1 WHERE id = $2', [role, userId]);
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
  },

  async getSpreadsheetMappings(req, res) {
    try {
      const result = await pool.query('SELECT * FROM auth.spreadsheet_mappings');
      const mappings = result.rows.reduce((acc, row) => {
        if (!acc[row.organization_id]) acc[row.organization_id] = {};
        acc[row.organization_id][row.spreadsheet_type] = row.spreadsheet_id;
        return acc;
      }, {});
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching spreadsheet mappings', error: error.message });
    }
  },
  
  async saveSpreadsheetMappings(req, res) {
    const { organizationId, mappings } = req.body;
    console.log('Received request:', { organizationId, mappings });
    try {
      for (const [type, id] of Object.entries(mappings)) {
        await pool.query(
          'INSERT INTO auth.spreadsheet_mappings (tenant_id, organization_id, spreadsheet_type, spreadsheet_id) VALUES ($1, $2, $3, $4) ON CONFLICT (tenant_id, organization_id, spreadsheet_type) DO UPDATE SET spreadsheet_id = EXCLUDED.spreadsheet_id',
          [req.tenantId, organizationId, type, id]
        );
      }
      console.log('Spreadsheet mappings saved successfully');
      res.json({ message: 'Spreadsheet mappings saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving spreadsheet mappings', error: error.message });
    }
  }
  


};

module.exports = adminController;
