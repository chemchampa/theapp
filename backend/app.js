const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();
const passport = require('./config/passport');
const authRoutes = require('./auth/routes/authRoutes');
const { protect, checkRole } = require('./auth/middleware/authMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');
const { setTenantAndOrganization } = require('./middleware/tenantMiddleware');
const fs = require('fs');
const roleLogger = require('./middleware/roleLogger');
const adminController = require('./controllers/adminController');



const app = express();
const port = process.env.PORT || 5000;

// For testing only
app.get('/hello', (req, res) => {
  console.log('Hello route hit');
  res.json({ message: 'Hello, World!' });
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(setTenantAndOrganization);

// Use auth routes
// app.use('/auth', authRoutes);

console.log('Starting server...');
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use('/auth', (req, res, next) => {
  console.log('Auth route accessed');
  next();
}, require('./auth/routes/authRoutes'));

app.use(roleLogger);

// For testing
app.use((err, req, res, next) => {
  console.error(err.stack);
  fs.writeFileSync('debug.log', `Error: ${err.stack}\n`, {flag: 'a'});
  res.status(500).send('Something broke!');
});

// For testing
app.post('/test-login', express.json(), (req, res) => {
  console.log('Test login route hit');
  console.log('Request body:', req.body);
  res.json({ message: 'Test login route working', body: req.body });
});

// For testing
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});


// Import routes
const placeOrderRoutes = require('./routes/placeOrder');
const wholesaleOrderPickingRoutes = require('./routes/wholesaleOrderPicking');
const wholesaleCustomersDetailsRoutes = require('./routes/wholesaleCustomersDetails');
const wholesaleCustomersPricesRoutes = require('./routes/wholesaleCustomersPrices');
const roastedCoffeePricesRoutes = require('./routes/roastedCoffeePrices');
const pricesCalculatorRoutes = require('./routes/pricesCalculator');


// Use routes
  /*
    With this approach, I need to look into the route files to see what specific endpoints my API has.
    This setup is generally considered a better practice, especially for larger applications or when
    the developer expects the application to grow. It provides better organization and scalability.
  */
// "Place Order" routes (/api/products, /api/customers, /api/orders)
app.use('/api', protect, setTenantAndOrganization, placeOrderRoutes);
// "Wholesale Order Picking" routes (/api/wholesale-orders)
app.use('/api', protect, setTenantAndOrganization, wholesaleOrderPickingRoutes);
// "Wholesale Customers Details" routes (/api/whcustomer-details)
app.use('/api', protect, setTenantAndOrganization, wholesaleCustomersDetailsRoutes);
// "Wholesale Customers Prices" routes (/api/whcustomer-prices)
app.use('/api', protect, setTenantAndOrganization, wholesaleCustomersPricesRoutes);

app.use('/api', protect, roastedCoffeePricesRoutes);

app.use('/api/prices-calculator', protect, setTenantAndOrganization, pricesCalculatorRoutes);


// Protected route for all authenticated users
app.get('/api/protected', protect, setTenantAndOrganization, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user,
    tenantId: req.tenantId,
    organizationId: req.organizationId
  });
});

// Protected route only for admin users
app.get('/api/admin', protect, setTenantAndOrganization, checkRole(['admin']), (req, res) => {
  res.json({ 
    message: 'This is an admin-only route', 
    user: req.user,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
    role: role
  });
});

// For testing
const pool = require('./config/db');
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection successful', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});


// // Admin routes
// app.use('/admin', protect, checkRole(['admin']), require('./routes/adminRoutes'));
app.get('/admin/users', protect, setTenantAndOrganization, checkRole(['admin']), adminController.getUsers);
app.get('/admin/organizations', protect, setTenantAndOrganization, checkRole(['admin']), adminController.getOrganizations);

// app.get('/admin/spreadsheets', protect, setTenantAndOrganization, checkRole(['admin']), adminController.getSpreadsheets);
// app.post('/admin/assign-spreadsheet', protect, setTenantAndOrganization, checkRole(['admin']), adminController.assignSpreadsheet);
app.get('/admin/spreadsheet-mappings', protect, setTenantAndOrganization, checkRole(['admin']), adminController.getSpreadsheetMappings);
app.post('/admin/save-spreadsheet-mappings', protect, setTenantAndOrganization, checkRole(['admin']), adminController.saveSpreadsheetMappings);

app.put('/admin/user-role/:userId', protect, setTenantAndOrganization, checkRole(['admin']), adminController.updateUserRole);
/*
  By adding the setTenantAndOrganization middleware, we maintain consistency with your other protected routes and ensure
  that the tenant and organization context is properly set for these admin operations.
*/


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  fs.appendFileSync('debug.log', `Error: ${err.stack}\n`);
  res.status(500).send('Something broke!');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
