// Must run after `protect`, which sets req.user.
export function requireSuperAdmin(req, res, next) {
  if (!req.user?.isSuperAdmin) {
    res.status(403);
    throw new Error("Super admin access required");
  }
  next();
}
