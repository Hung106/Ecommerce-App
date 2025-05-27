// controllers/user.js
const connectDB = require("../sqlConfig"); // connectDB() trả về Promise<ConnectionPool>
const sql = require("mssql");

/**
 * GET /api/users
 */
async function getAllUsers(req, res) {
  try {
    const pool = await connectDB(); // Lấy pool kết nối
    const result = await pool
      .request() // Dùng pool.request()
      .query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/users/:id
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("user_id", sql.NVarChar(50), id)
      .query("SELECT * FROM users WHERE user_id = @user_id");
    if (!result.recordset.length)
      return res.status(404).json({ error: "User not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /api/users
 */
async function createUser(req, res) {
  try {
    const { user_id, last_name, first_name, email, password, user_type } =
      req.body;
    const pool = await connectDB();
    await pool
      .request()
      .input("user_id", sql.NVarChar(50), user_id)
      .input("last_name", sql.NVarChar(30), last_name)
      .input("first_name", sql.NVarChar(100), first_name)
      .input("email", sql.NVarChar(50), email)
      .input("password", sql.NVarChar(50), password)
      .input("user_type", sql.NVarChar(10), user_type).query(`
          INSERT INTO users(user_id, last_name, first_name, email, password, user_type)
          VALUES(@user_id, @last_name, @first_name, @email, @password, @user_type)
        `);
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    // Duplicate key (constraint on email or user_id)
    if (err.number === 2627) {
      const msg = err.originalError?.info?.message || err.message;
      if (msg.includes("email")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      if (msg.includes("PRIMARY")) {
        return res.status(409).json({ error: "User ID already exists" });
      }
      return res.status(409).json({ error: "Duplicate key error" });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

/**
 * PUT /api/users/:id
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { last_name, first_name, email, password, user_type } = req.body;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("user_id", sql.NVarChar(50), id)
      .input("last_name", sql.NVarChar(30), last_name)
      .input("first_name", sql.NVarChar(100), first_name)
      .input("email", sql.NVarChar(50), email)
      .input("password", sql.NVarChar(50), password)
      .input("user_type", sql.NVarChar(10), user_type).query(`
          UPDATE users
          SET last_name  = @last_name,
              first_name = @first_name,
              email      = @email,
              password   = @password,
              user_type  = @user_type
          WHERE user_id = @user_id
        `);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ message: "User updated" });
  } catch (err) {
    if (err.number === 2627) {
      const msg = err.originalError?.info?.message || err.message;
      if (msg.includes("email")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      return res.status(409).json({ error: "Duplicate key error" });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

/**
 * DELETE /api/users/:id
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("user_id", sql.NVarChar(50), id)
      .query("DELETE FROM users WHERE user_id = @user_id");
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
