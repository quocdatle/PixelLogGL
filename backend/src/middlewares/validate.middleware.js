const { error } = require('../utils/responseFormatter');

// Middleware kiểm tra nhanh các field bắt buộc có trong req.body không.
// Dùng cho validate đơn giản; nếu sau này cần validate phức tạp hơn (email format,
// độ dài mật khẩu...) có thể nâng cấp lên thư viện như express-validator hoặc zod.
//
// Cách dùng: router.post('/register', validateBody(['email', 'password', 'username']), authController.register)
function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      return error(res, `Thiếu trường bắt buộc: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    next();
  };
}

module.exports = validateBody;
