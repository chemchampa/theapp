const { body, validationResult } = require('express-validator');

const registerValidationRules = () => {
  return [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('tenantId').notEmpty().withMessage('Tenant ID is required'),
    body('organizationId').optional().isInt().withMessage('Organization ID must be an integer'),
    body('organizationName')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Organization name must be between 2 and 100 characters')
      .custom((value, { req }) => {
        if (!req.body.organizationId && !value) {
          throw new Error('Either Organization ID or Organization Name must be provided');
        }
        return true;
      }),
  ]
}

const loginValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    body('tenantId').notEmpty().withMessage('Tenant ID is required'),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
  registerValidationRules,
  loginValidationRules,
  validate,
}
