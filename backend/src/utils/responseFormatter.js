// Format response thống nhất cho toàn bộ API — mọi module đều dùng 2 hàm này,
// không tự ý trả response theo format riêng (xem CLAUDE.md mục 5).

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function error(res, message, statusCode = 400, code = 'ERROR') {
  return res.status(statusCode).json({ success: false, message, code });
}

module.exports = { success, error };
