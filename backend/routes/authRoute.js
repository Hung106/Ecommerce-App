// routes/authRoute.js
const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController"); // đường dẫn tới auth.js
const authMiddleware = require("../middlewares/auth"); // nếu có middleware xác thực

// Đăng ký
router.post("/register", authCtrl.register);

// Đăng nhập
router.post("/login", authCtrl.login);

module.exports = router;
