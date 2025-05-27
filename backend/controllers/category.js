const connectDB = require("../sqlConfig");
const sql = require("mssql");

// Category
/**
 * GET /api/categories
 */
async function getAllCategories(req, res) {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT category_id, name FROM categories");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/categories/:id
 */
async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("category_id", sql.NVarChar(50), id)
      .query("SELECT * FROM categories WHERE category_id = @category_id");
    if (!result.recordset.length) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /api/categories
 * Body: { category_id, name, description }
 */
async function insertCategory(req, res) {
  const transaction = new sql.Transaction(await connectDB());
  try {
    const { category_id, name} = req.body;
    await transaction.begin();
    const request = new sql.Request(transaction);
    await request
      .input("category_id", sql.NVarChar(50), category_id)
      .input("name", sql.NVarChar(255), name)
      .query(
        "INSERT INTO categories (category_id, name) VALUES (@category_id, @name)"
      );
    await transaction.commit();
    res.status(201).json({ message: "Category inserted successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * PUT /api/categories/:id
 * Body: { name, description }
 */
async function updateCategory(req, res) {
  const transaction = new sql.Transaction(await connectDB());
  try {
    const { id } = req.params;
    const { name} = req.body;
    await transaction.begin();
    const request = new sql.Request(transaction);
    const result = await request
      .input("category_id", sql.NVarChar(50), id)
      .input("name", sql.NVarChar(255), name)
      .query(
        "UPDATE categories SET name = @name WHERE category_id = @category_id"
      );
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "Category not found" });
    }
    await transaction.commit();
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * DELETE /api/categories/:id
 */
async function deleteCategory(req, res) {
  const transaction = new sql.Transaction(await connectDB());
  try {
    const { id } = req.params;
    await transaction.begin();
    const request = new sql.Request(transaction);
    const result = await request
      .input("category_id", sql.NVarChar(50), id)
      .query("DELETE FROM categories WHERE category_id = @category_id");
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "Category not found" });
    }
    await transaction.commit();
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports={
    getAllCategories,
    getCategoryById,
    insertCategory, 
    deleteCategory
}