// =============================================
// middleware/rbac.js
// Role-Based Access Control (RBAC) Middleware
//
// This middleware checks if the logged-in user
// has the correct ROLE to access a specific route.
//
// Usage example in routes:
//   router.post('/purchases', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), createPurchase);
//   router.get('/audit-logs', protect, authorize('Admin'), getAuditLogs);
// =============================================

// authorize() returns a middleware function
// It accepts one or more allowed roles as arguments
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware (auth.js)
    // If somehow it's missing, deny access
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not allowed to perform this action.`,
      });
    }

    // Role is allowed, proceed to the route handler
    next();
  };
};

module.exports = { authorize };
