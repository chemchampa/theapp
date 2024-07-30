const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../config/db');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/emailService');

const logger = require('../../logger');


const authController = {
  async register(req, res) {
    const { username, email, password, tenantId, organizationName, organizationCode } = req.body;

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        let organizationId;

        if (organizationCode) {
          // User is joining an existing organization
          const orgResult = await client.query('SELECT id FROM auth.organizations WHERE code = $1 AND tenant_id = $2', [organizationCode, tenantId]);
          if (orgResult.rows.length === 0) {
            throw new Error('Invalid organization code');
          }
          organizationId = orgResult.rows[0].id;
        } else if (organizationName) {
          // Creating a new organization
          const code = crypto.randomBytes(4).toString('hex').toUpperCase();
          const orgResult = await client.query(
            'INSERT INTO auth.organizations (name, code, tenant_id) VALUES ($1, $2, $3) RETURNING id',
            [organizationName, code, tenantId]
          );
          organizationId = orgResult.rows[0].id;
          
          // Generate spreadsheet mappings for the new organization
          await generateSpreadsheetMappings(client, tenantId, organizationId);
        } else {
          throw new Error('Either organization name or code must be provided');
        }

        // Check if user already exists
        const userCheck = await client.query('SELECT * FROM auth.users WHERE email = $1 AND tenant_id = $2 AND organization_id = $3', [email, tenantId, organizationId]);
        if (userCheck.rows.length > 0) {
          throw new Error('User already exists in this organization');
        }

        // Create the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userResult = await client.query(
          'INSERT INTO auth.users (username, email, password, tenant_id, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [username, email, hashedPassword, tenantId, organizationId]
        );

        await client.query('COMMIT');

        // Create JWT
        const token = jwt.sign(
          { userId: userResult.rows[0].id, tenantId, organizationId },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: userResult.rows[0].id,
            username,
            email,
            tenantId,
            organizationId
          },
          token
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  },

  async login(req, res) {
    console.log('Login attempt received', { email: req.body.email, password: req.body.password });
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    const { email, password } = req.body;

    try {
      // Check if user exists
      const userResult = await pool.query(
        'SELECT u.*, o.tenant_id FROM auth.users u JOIN auth.organizations o ON u.organization_id = o.id WHERE u.email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const user = userResult.rows[0];
      console.log('User role:', user.role);
      console.log('User object from database:', user);

      // Check password: secure comparison for passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Create JWT
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          tenantId: user.tenant_id,
          organizationId: user.organization_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour in milliseconds
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id,
          organizationId: user.organization_id
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      logger.error('Login error', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  },  

  async checkAuth(req, res) {
    console.log('checkAuth called, full user object:', req.user);
    if (req.user) {
      res.json({
        isAuthenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          tenantId: req.user.tenant_id,
          organizationId: req.user.organization_id,
        }
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  },
  
  async getCurrentUser(req, res) {
    if (req.user) {
      res.json({
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          tenantId: req.user.tenant_id,
          organizationId: req.user.organization_id
        }
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  },  

  async logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  },

  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const userResult = await pool.query('SELECT id, tenant_id, organization_id FROM auth.users WHERE id = $1', [decoded.userId]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];
      const newAccessToken = jwt.sign(
        { userId: user.id, tenantId: user.tenant_id, organizationId: user.organization_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await pool.query('SELECT * FROM auth.users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      await pool.query(
        'UPDATE auth.users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
        [resetToken, resetTokenExpiry, user.rows[0].id]
      );

      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
      await sendEmail(
        email,
        'Password Reset',
        `Please use this link to reset your password: ${resetUrl}`
      );

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error processing request' });
    }
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      const user = await pool.query(
        'SELECT * FROM auth.users WHERE reset_token = $1 AND reset_token_expiry > $2',
        [token, Date.now()]
      );

      if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await pool.query(
        'UPDATE auth.users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
        [hashedPassword, user.rows[0].id]
      );

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  },

  async verifyEmail(req, res) {
    const { token } = req.params;
    try {
      const user = await pool.query(
        'SELECT * FROM auth.users WHERE verification_token = $1',
        [token]
      );

      if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      await pool.query(
        'UPDATE auth.users SET is_verified = true, verification_token = NULL WHERE id = $1',
        [user.rows[0].id]
      );

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Error verifying email' });
    }
  }
};

async function generateSpreadsheetMappings(client, tenantId, organizationId) {
  const spreadsheetTypes = ['SETTINGS', 'ORDERS', 'WHOLESALE_CUSTOMERS', 'RETAIL_INVENTORY', 'COFFEE_PRICES'];
  for (const type of spreadsheetTypes) {
    const spreadsheetId = await createNewSpreadsheet(type); // This function would use Google Sheets API to create a new spreadsheet
    await client.query(
      'INSERT INTO auth.spreadsheet_mappings (tenant_id, organization_id, spreadsheet_type, spreadsheet_id) VALUES ($1, $2, $3, $4)',
      [tenantId, organizationId, type, spreadsheetId]
    );
  }
}

// This function creates new spreadsheets for each organisation using Google Sheets API
async function createNewSpreadsheet(type) {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    let title;
    let sheets_to_create = [];

    switch (type) {
      case 'SETTINGS':
        title = 'Settings';
        sheets_to_create = ['Settings'];
        break;
      case 'ORDERS':
        title = 'Orders';
        sheets_to_create = ['Wholesale Orders', 'WHOTest'];
        break;
      case 'WHOLESALE_CUSTOMERS':
        title = 'Wholesale Customers';
        sheets_to_create = ['Wholesale Customers', 'Wholesale Customers Details', 'Wholesale Customers Prices'];
        break;
      case 'RETAIL_INVENTORY':
        title = 'Retail Inventory';
        sheets_to_create = ['Tea Inventory', 'HotChoc Inventory', 'Retail Products Inventory'];
        break;
      case 'COFFEE_PRICES':
        title = 'Coffee Prices';
        sheets_to_create = ['Coffee Prices', 'Prices Calculator'];
        break;
      default:
        throw new Error(`Invalid spreadsheet type: ${type}`);
    }

    const resource = {
      properties: {
        title: `${title} - ${new Date().toISOString().split('T')[0]}`
      },
      sheets: sheets_to_create.map(sheet_title => ({
        properties: { title: sheet_title }
      }))
    };

    const spreadsheet = await sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId'
    });

    console.log(`Created new spreadsheet with ID: ${spreadsheet.data.spreadsheetId}`);
    return spreadsheet.data.spreadsheetId;
  } catch (error) {
    console.error('Error creating new spreadsheet:', error);
    throw error;
  }
}

module.exports = authController;
