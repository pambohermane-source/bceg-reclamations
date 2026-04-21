const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'bceg-reclamations-secret-2026';

function authMiddleware(req, res, next) {
  var token = req.cookies && req.cookies.token;
  if (!token) return res.redirect('/login');
  try {
    var decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch(e) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

function roleRequired(roles) {
  return function(req, res, next) {
    if (!req.user) return res.redirect('/login');
    if (roles.includes(req.user.role)) return next();
    res.status(403).send('Acces non autorise');
  };
}

module.exports = { authMiddleware, roleRequired, SECRET };
