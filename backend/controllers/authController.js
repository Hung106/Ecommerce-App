const connectDB = require("../sqlConfig");
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Tạo user_id ngẫu nhiên
const generateUserId = () => {
  return `user_${uuidv4().substring(0, 8)}`;
};

/**
 * Đăng ký tài khoản mới
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { last_name, first_name, email, password, shop_name } = req.body;
    const user_type = "customer"; // Mặc định người dùng mới là customer

    // Validate dữ liệu đầu vào
    if (!last_name || !first_name || !email || !password) {
      return res.status(400).json({ error: "Thiếu thông tin đăng ký" });
    }

    const pool = await connectDB();

    // Kiểm tra email đã tồn tại chưa
    const emailCheck = await pool
      .request()
      .input("email", sql.NVarChar(50), email)
      .query("SELECT email FROM users WHERE email = @email");

    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }

    // Tạo user_id mới
    const user_id = generateUserId();

    // Thêm user vào database
    await pool
      .request()
      .input("user_id", sql.NVarChar(50), user_id)
      .input("last_name", sql.NVarChar(30), last_name)
      .input("first_name", sql.NVarChar(100), first_name)
      .input("email", sql.NVarChar(50), email)
      .input("password", sql.NVarChar(50), password)
      .input("user_type", sql.NVarChar(10), user_type)
      .query(
        `INSERT INTO users (user_id, last_name, first_name, email, password, user_type)
           VALUES (@user_id, @last_name, @first_name, @email, @password, @user_type)`
      );

    // Thêm vào bảng customers
    await pool
      .request()
      .input("user_id", sql.NVarChar(50), user_id)
      .query("INSERT INTO customers (user_id) VALUES (@user_id)");

    // Tạo JWT token
    const token = jwt.sign(
      {
        user_id,
        user_type,
        email,
        first_name,
        last_name,
        name: `${first_name} ${last_name}`,

      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      user: { user_id, email, name: `${first_name} ${last_name}`, user_type },
      token,
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
}

/**
 * Đăng nhập
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
    }

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("email", sql.NVarChar(50), email)
      .input("password", sql.NVarChar(50), password).query(`
        SELECT user_id, first_name, last_name, email, user_type
        FROM users
        WHERE email = @email AND password = @password
      `);

    if (result.recordset.length === 0) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác" });
    }

    const user = result.recordset[0];

    // Tạo JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_type: user.user_type,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      user: {
        user_id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
      },
      token,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
}

/**
 * Lấy thông tin user hiện tại
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    // user_id lấy từ token đã được xử lý qua middleware auth
    const { user_id } = req.user;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("user_id", sql.NVarChar(50), user_id).query(`
        SELECT user_id, first_name, last_name, email, user_type
        FROM users
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    const user = result.recordset[0];

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        user_type: user.user_type,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.error("Lỗi lấy thông tin người dùng:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
