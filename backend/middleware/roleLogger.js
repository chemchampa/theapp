// const roleLogger = (req, res, next) => {
//     const userRole = req.headers['x-user-role'] || 'No role';
//     console.log(`Request to ${req.method} ${req.path} - User Role: ${userRole}`);
//     next();
// };


const roleLogger = (req, res, next) => {
  console.log('Full user object:', req.user);
  console.log(`Request to ${req.method} ${req.path} - User Role: ${req.user?.role || 'No role'}`);
  next();
};

module.exports = roleLogger;
  