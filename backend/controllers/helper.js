const connectDB = require("../sqlConfig");
const sql = require("mssql");

async function checkIfTableExists(tableName) {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('tableName', sql.VarChar(20), tableName)
      .query(`
        SELECT * FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = @tableName
      `);
    console.log("Check over")
    return result.recordset.length > 0;
  } catch (err) {
    console.error('Lỗi kiểm tra bảng:', err);
    return false;
  }
}

module.exports={checkIfTableExists}