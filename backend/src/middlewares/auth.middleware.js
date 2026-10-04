const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/responseFormatter');

// Mọi route cần đăng nhập mới dùng được thì gắn middleware này vào route,
// KHÔNG tự viết lại logic verify JWT trong từng controller (xem CLAUDE.md mục 5).
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Thiếu token xác thực', 401, 'NO_TOKEN');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId; // các controller phía sau dùng req.userId
    next();
  } catch (err) {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn', 401, 'INVALID_TOKEN');
  }
}

module.exports = requireAuth;
