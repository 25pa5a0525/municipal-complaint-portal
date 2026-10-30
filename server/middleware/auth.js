function requireAdminAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Administrator session expired or invalid. Please log in.'
  });
}

module.exports = { requireAdminAuth };
