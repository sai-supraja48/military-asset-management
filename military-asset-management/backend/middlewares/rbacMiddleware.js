export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied: insufficient authorization level.'
      });
    }
    next();
  };
};

export function enforceBaseScope(req, res, next) {
  if (req.user?.role === 'BASE_COMMANDER' && req.user.baseId) {
    req.scopedBaseId = Number(req.user.baseId);
  }
  next();
}
