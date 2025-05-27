const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware xác thực JWT token
const auth = (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Không tìm thấy token xác thực" });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gán thông tin user vào request để sử dụng trong các controller
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error.message);
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};

// Middleware kiểm tra quyền seller
const sellerAuth = (req, res, next) => {
  // Kiểm tra user đã được xác thực bởi middleware auth chưa
  if (!req.user) {
    return res.status(401).json({ error: "Yêu cầu xác thực" });
  }

  // Kiểm tra role của user
  if (req.user.user_type !== "seller") {
    return res
      .status(403)
      .json({ error: "Không có quyền truy cập. Yêu cầu quyền seller" });
  }

  next();
};

// Middleware kiểm tra quyền customer
const customerAuth = (req, res, next) => {
  // Kiểm tra user đã được xác thực bởi middleware auth chưa
  if (!req.user) {
    return res.status(401).json({ error: "Yêu cầu xác thực" });
  }

  // Kiểm tra role của user
  if (req.user.user_type !== "customer") {
    return res
      .status(403)
      .json({ error: "Không có quyền truy cập. Yêu cầu quyền customer" });
  }

  next();
};

// Middleware kiểm tra role linh hoạt (cho phép nhiều loại role)
const roleAuth = (roles = []) => {
  // Convert string parameter to array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // Kiểm tra user đã được xác thực bởi middleware auth chưa
    if (!req.user) {
      return res.status(401).json({ error: "Yêu cầu xác thực" });
    }

    // Kiểm tra role của user có nằm trong danh sách được phép không
    if (roles.length && !roles.includes(req.user.user_type)) {
      return res.status(403).json({
        error: `Không có quyền truy cập. Yêu cầu một trong các quyền: ${roles.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

// Export tất cả middleware
module.exports = {
  auth,
  sellerAuth,
  customerAuth,
  roleAuth,
};
