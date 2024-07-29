const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const organizationController = require('../controllers/organizationController');
const { registerValidationRules, loginValidationRules, validate } = require('../../middleware/validationMiddleware');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/register', registerValidationRules(), validate, authController.register);

// router.post('/login', (req, res, next) => {
//   console.log('Login route hit');
//   next();
// }, loginValidationRules(), validate, authController.login);

// router.post('/login', loginValidationRules(), validate, authController.login);

// Temporarily for testing purposes -->
router.post('/login', authController.login);



router.get('/check', protect, authController.checkAuth);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

router.get('/organizations', organizationController.getOrganizations);
router.post('/organizations', organizationController.createOrganization);
router.post('/set-organization', organizationController.setUserOrganization);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign(
    { 
      userId: req.user.id, 
      email: req.user.email, 
      tenantId: req.user.tenant_id, 
      organizationId: req.user.organization_id 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
  
  if (!req.user.tenant_id || !req.user.organization_id) {
    // Redirect to a page where the user can select or create an organization
    res.redirect(`/select-organization?token=${token}`);
  } else {
    res.redirect(`/auth-success?token=${token}`);
    // // User already has an organization, proceed to dashboard or main page
    // res.redirect(`/dashboard?token=${req.user.token}`);
  }
});

router.post('/refresh-token', authController.refreshToken);

router.get('/me', passport.authenticate('jwt', { session: false }), authController.getCurrentUser);

const pool = require('../../config/db');

router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection successful', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});


module.exports = router;
