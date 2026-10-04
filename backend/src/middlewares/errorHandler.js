const { error } = require('../utils/responseFormatter');

// Middleware bắt lỗi tập trung — mọi controller nên dùng try/catch rồi next(err)
// để lỗi đi qua đây, tránh mỗi module tự xử lý lỗi một kiểu khác nhau.
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  if (err.name === 'ValidationError') {
    return error(res, err.message, 400, 'VALIDATION_ERROR');
  }
  if (err.name === 'CastError') {
    return error(res, 'ID không hợp lệ', 400, 'INVALID_ID');
  }
  if (err.code === 11000) {
    return error(res, 'Dữ liệu đã tồn tại (trùng khóa duy nhất)', 409, 'DUPLICATE_KEY');
  }

  return error(res, err.message || 'Lỗi server không xác định', err.statusCode || 500, err.code || 'SERVER_ERROR');
}

module.exports = errorHandler;
