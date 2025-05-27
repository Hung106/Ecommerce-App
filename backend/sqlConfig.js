const sql = require("mssql");

const sqlConfig = {
  user: "hung",
  password: "hung",
  server: "localhost",
  database: "e_commerce",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const connectDB = async () => {
  try {
    return await sql.connect(sqlConfig);
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

module.exports = connectDB;