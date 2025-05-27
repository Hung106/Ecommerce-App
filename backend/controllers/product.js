// src/controllers/products.controller.js
const connectDB = require("../sqlConfig");
const sql = require("mssql");
const { v4: uuidv4 } = require("uuid");
/**
 * GET /api/products
 */
async function getAllProducts(req, res) {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM products");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
async function getRandomTenProducts(req, res) { 
  const numberOfProductsToFetch = 50; 

  try {
    const pool = await connectDB();

    // 1. Lấy ngẫu nhiên các sản phẩm từ bảng 'products'
    const productResult = await pool.request().query(`SELECT TOP ${numberOfProductsToFetch} * FROM products ORDER BY NEWID()`);
    const randomProductRecords = productResult.recordset;

    if (!randomProductRecords || randomProductRecords.length === 0) {
      // Trả về 200 với mảng data rỗng nếu không có sản phẩm nào
      return res.status(200).json({ message: "No products found to select randomly.", data: [] });
    }

    // 2. Lấy tất cả hình ảnh từ bảng 'images'
    // Để tối ưu hơn nếu bảng images rất lớn, bạn có thể chỉ lấy ảnh cho các product_id đã chọn ở trên.
    // Tuy nhiên, để nhất quán với getAllProductsRecLayer, chúng ta sẽ lấy tất cả trước.
    const allImagesResult = await pool.request().query("SELECT product_id, image_url FROM images");
    const allImagesList = allImagesResult.recordset || [];

    // 3. Xử lý và gắn hình ảnh vào từng sản phẩm
    const productsWithDetails = randomProductRecords.map(product => {
      // Lọc hình ảnh cho sản phẩm hiện tại
      const productSpecificImages = allImagesList
        .filter(img => img.product_id === product.product_id)
        .map(img => img.image_url);

      return {
        ...product, // Giữ lại tất cả các thuộc tính gốc của sản phẩm
        img: productSpecificImages, // Thêm mảng URL hình ảnh
        rating: product.rating_average, // Gán rating_average cho rating để đồng bộ với frontend nếu cần
                                        // (nếu rating_average không tồn tại, product.rating sẽ là undefined)
      };
    });
    
    res.json({ data: productsWithDetails });

  } catch (err) {
    console.error("Error in getRandomTenProducts:", err);
    // Trả về mảng data rỗng khi có lỗi server
    res.status(500).json({ error: "Server error while fetching random products", data: [] });
  }
}
async function getAllProductsRecLayer(req, res){
  console.log("Layering")
  try {
    const pool = await connectDB();
    console.log("Layering")
    const filtered = req.query.filtered ? req.query.filtered : ""
    let query = `SELECT p.product_id, p.title, p.brand,
                        p.description, p.seller_id,p.category_id,
                        p.review_nums, p.rating_average, p.favorite,
                        c.color, s.size, s.sold, s.stock,
                        s.intitial_price, s.final_price
                        FROM products AS p
                        JOIN product_color AS c ON p.product_id = c.product_id
                        JOIN product_size AS s ON p.product_id = s.product_id
                        WHERE (p.title LIKE @f OR p.brand LIKE @f)`
    const {brand, category_id,seller_id} = req.query
    if (brand) query += ` AND p.brand = @brand`
    if (category_id) query += ` AND p.category_id = @cate`
    if (seller_id) query += ` AND p.seller_id = @seller_id`
    const {page, offset} = req.query
    const pagination = ` ORDER BY p.product_id
                        OFFSET @o ROWS
                        FETCH NEXT @p ROWS ONLY`
    const result = await pool.request()
                  .input("f", sql.NVarChar(255), `%${filtered}%`)
                  .input("p", sql.Int, page || 10)
                  .input("o", sql.Int, offset ? (offset - 1 < 0 ? 0 : offset - 1) : 0)
                  .input("brand",sql.NVarChar(50), brand)
                  .input("cate", sql.NVarChar(50), category_id)
                  .input("seller_id", sql.NVarChar(50), seller_id)
                  .query(query + pagination)
    const img = await pool.request()
                .query(`SELECT * FROM images`)
    const imgLst = img.recordset.length <= 0 ? [] : img.recordset
    console.log(result.recordset)
    if (result.recordset.length <= 0) return res.status(400).json({message: "No products found"})
    const reduceSet = Array.from(
              new Map(
                result.recordset.map(item => [
                  item.product_id, // key for uniqueness
                  {
                    product_id: item.product_id,
                    title: item.title,
                    brand: item.brand,
                    description: item.description,
                    seller_id: item.seller_id,
                    category_id: item.category_id,
                    review_nums: item.review_nums,
                    rating: item.rating_average,
                    favorite: item.favorite, 
                    img: imgLst.filter(img => img.product_id === item.product_id).map(img => img.image_url)
                  }
                ])
              ).values()
            );
    const itemsMatch = reduceSet.map((item) => {
      return {
        ...item,
        color: result.recordset
        .filter(co => co.product_id === item.product_id)
        .map((co) => {
          return {  
            color: co.color,
            size : result.recordset
            .filter(si => si.product_id === item.product_id && si.color === co.color)
            .map((si) => {
              return {
                size: si.size,
                sold: si.sold,
                stock: si.stock,
                initial_price: si.intitial_price,
                final_price: si.final_price
              }
            })
          }
        })
      }
    })
    res.status(200).json({data: itemsMatch})
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.message})
  }
}

async function getAllProductsRecLayerFiltered(req, res){
  console.log("Layering")
  try {
    const pool = await connectDB();
    const {seller_id} = req.query
    const filtered = req.query.filtered ? req.query.filtered : ""
    let query = `SELECT p.product_id, p.title, p.brand,
                        p.description, p.seller_id,p.category_id,
                        p.review_nums, p.rating_average, p.favorite,
                        c.color, s.size, s.sold, s.stock,
                        s.intitial_price, s.final_price
                        FROM products AS p
                        JOIN product_color AS c ON p.product_id = c.product_id
                        JOIN product_size AS s ON p.product_id = s.product_id
                        WHERE (p.title LIKE @f OR p.brand LIKE @f)`

    const {page, offset} = req.query
    const pagination = ` ORDER BY p.product_id
                        OFFSET @o ROWS
                        FETCH NEXT @p ROWS ONLY`
    const result = await pool.request()
                  .input("f", sql.NVarChar(255), `%${filtered}%`)
                  .input("p", sql.Int, page || 10)
                  .input("o", sql.Int, offset ? (offset - 1 < 0 ? 0 : offset - 1) : 0)
                  .input("brand",sql.NVarChar(50), brand)
                  .input("cate", sql.NVarChar(50), category_id)
                  .query(query + pagination)
    const img = await pool.request()
                .query(`SELECT * FROM images`)
    const imgLst = img.recordset.length <= 0 ? [] : img.recordset
    console.log(result.recordset)
    if (result.recordset.length <= 0) return res.status(400).json({message: "No products found"})
    const reduceSet = Array.from(
              new Map(
                result.recordset.map(item => [
                  item.product_id, // key for uniqueness
                  {
                    product_id: item.product_id,
                    title: item.title,
                    brand: item.brand,
                    description: item.description,
                    seller_id: item.seller_id,
                    category_id: item.category_id,
                    review_nums: item.review_nums,
                    rating: item.rating_average,
                    favorite: item.favorite, 
                    img: imgLst.filter(img => img.product_id === item.product_id).map(img => img.image_url)
                  }
                ])
              ).values()
            );
    const itemsMatch = reduceSet.map((item) => {
      return {
        ...item,
        color: result.recordset
        .filter(co => co.product_id === item.product_id)
        .map((co) => {
          return {  
            color: co.color,
            size : result.recordset
            .filter(si => si.product_id === item.product_id && si.color === co.color)
            .map((si) => {
              return {
                size: si.size,
                sold: si.sold,
                stock: si.stock,
                initial_price: si.intitial_price,
                final_price: si.final_price
              }
            })
          }
        })
      }
    })
    res.status(200).json({data: itemsMatch})
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error.message})
  }
}


/**
 * GET /api/products/:id
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("product_id", sql.NVarChar(50), id)
      .query("SELECT * FROM products WHERE product_id = @product_id");
    if (!result.recordset.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getProductByIdRecLayer(req, res) {
  try {
    const pool = await connectDB();
    const {id} = req.params
    const result = await pool.request()
                  .input("id", sql.NVarChar(50), id)
                  .query(`SELECT p.product_id, p.title, p.brand,
                        p.description, p.seller_id,p.category_id,
                        p.review_nums, p.rating_average, p.favorite,
                        c.color, s.size, s.sold, s.stock,
                        s.intitial_price, s.final_price
                        FROM products AS p
                        JOIN product_color AS c ON p.product_id = c.product_id
                        JOIN product_size AS s ON p.product_id = s.product_id
                        WHERE p.product_id = @id
                    `)
    const img = await pool.request()
              .input("id1", sql.NVarChar(50), id)
              .query(`SELECT * FROM images WHERE product_id = @id1 ORDER BY image_id`)
    const imgLst = img.recordset.length <= 0 ? [] : img.recordset
    console.log(result.recordset)
    if (result.recordset.length <= 0) return res.status(400).json({message: "No products found"})
    const reduceSet = Array.from(
              new Map(
                result.recordset.map(item => [
                  item.product_id, // key for uniqueness
                  {
                    product_id: item.product_id,
                    title: item.title,
                    brand: item.brand,
                    description: item.description,
                    seller_id: item.seller_id,
                    category_id: item.category_id,
                    review_nums: item.review_nums,
                    rating: item.rating_average,
                    favorite: item.favorite,
                    img: imgLst.filter(img => img.product_id === item.product_id).map(img => img.image_url)
                  }
                ])
              ).values()
            );
    const itemsMatch = reduceSet.map((item) => {
      return {
        ...item,
        color: result.recordset
        .filter(co => co.product_id === item.product_id)
        .map((co) => {
          return {  
            color: co.color,
            size : result.recordset
            .filter(si => si.product_id === item.product_id && si.color === co.color)
            .map((si) => {
              return {
                size: si.size,
                sold: si.sold,
                stock: si.stock,
                initial_price: si.intitial_price,
                final_price: si.final_price
              }
            })
          }
        })
      }
    })
    res.status(200).json({data: itemsMatch[0]})
  } catch (error) {
    console.error("Lỗi trong getProductByIdRecLayer:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết sản phẩm.", error: error.message });
  }
}
/**
 * POST /api/products
 * Body: {
 *   product_id, url, title, brand,
 *   description, breadcrumb,
 *   seller_id, category_id,
 *   color, size, sold, stock,
 *   intitial_price, final_price
 * }
 */
function mapInsertCode(code) {
  switch (code) {
    case -1:
      return "Product ID không được để trống.";
    case -2:
      return "Tiêu đề sản phẩm không được để trống.";
    case -3:
      return "Thương hiệu không được để trống.";
    case -4:
      return "Mô tả sản phẩm không được để trống.";
    case -5:
      return "Seller ID không được để trống.";
    case -6:
      return "Category ID không được để trống.";
    case -7:
      return "Seller ID không tồn tại.";
    case -8:
      return "Category ID không tồn tại.";
    case -9:
      return "Product ID đã tồn tại.";
    default:
      return "Không thể thêm sản phẩm.";
  }
}

async function insertProduct(req, res) {
  const pool = await connectDB()
  try {
    const product_id = uuidv4()
    const {
      title,
      brand,
      description,
      seller_id,
      category_id,
      url = "url",
      video = null,
      breadcrumb = null,
      lstImage_url,
      lstLayer
    } = req.body;
    if ( !title || !brand || !seller_id || !category_id || !lstImage_url || !lstLayer) return res.status(400).json({message: "Input data is invalid!"})
    await pool.request()
    .input("product_id", sql.NVarChar(50), product_id)
    .input("url", sql.NVarChar(sql.MAX), url)
    .input("title", sql.NVarChar(50), title)
    .input("brand", sql.NVarChar(50), brand)
    .input("video", sql.NVarChar(sql.MAX), video)
    .input("description", sql.NVarChar(sql.MAX), description || "")
    .input("breadcrumb", sql.NVarChar(sql.MAX), breadcrumb)
    .input("seller_id", sql.NVarChar(50), seller_id)
    .input("category_id", sql.NVarChar(50), category_id)
    .input("ProductVariantsJSON", sql.NVarChar(sql.MAX), JSON.stringify(lstLayer))
    .execute("insertProduct")
    for (let i in lstImage_url){
      const img = lstImage_url[i]
      await pool.request()
      .input("pid", sql.NVarChar(50), product_id)
      .input("url", sql.NVarChar(sql.MAX), img)
      .query(`INSERT INTO images(product_id, image_url)
              VALUES (@pid, @url)
      `)
    }
    return res.status(200).json({product_id, message: "Create Product successfully!"})
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Mapping mã trả về của UpdateProduct
function mapUpdateCode(code) {
  switch (code) {
    case -1:
      return "Product ID không được để trống.";
    case -2:
      return "Sản phẩm không tồn tại.";
    case -3:
      return "Seller ID mới không tồn tại.";
    case -4:
      return "Category ID mới không tồn tại.";
    case 1:
      return "Không có thay đổi nào được thực hiện.";
    default:
      return "Không thể cập nhật sản phẩm.";
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      title = null,
      brand = null,
      description = null,
      url = null,
      video = null,
      breadcrumb = null,
      new_seller_id = null,
      new_category_id = null,
    } = req.body;

    const pool = await connectDB();
    const result = await pool
      .request()
      .input("product_id", sql.NVarChar(50), id)
      .input("title", sql.NVarChar(255), title)
      .input("brand", sql.NVarChar(100), brand)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("url", sql.Text, url)
      .input("video", sql.Text, video)
      .input("breadcrumb", sql.NVarChar(sql.MAX), breadcrumb)
      .input("new_seller_id", sql.NVarChar(50), new_seller_id)
      .input("new_category_id", sql.NVarChar(50), new_category_id)
      .execute("UpdateProduct");

    if (result.returnValue !== 0) {
      const msg = mapUpdateCode(result.returnValue);
      const status = result.returnValue === 1 ? 200 : 400;
      return res.status(status).json({ message: msg });
    }
    return res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Mapping mã trả về của DeleteProduct
function mapDeleteCode(code) {
  switch (code) {
    case -1:
      return "Product ID không được để trống.";
    case -2:
      return "Sản phẩm không tồn tại.";
    case -3:
      return "Sản phẩm không thể xóa vì nằm trong đơn hàng đã xử lý.";
    default:
      return "Không thể xóa sản phẩm.";
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("product_id", sql.NVarChar(50), id)
      .execute("DeleteProduct");

    if (result.returnValue !== 0) {
      return res.status(400).json({ error: mapDeleteCode(result.returnValue) });
    }
    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllProductsRecLayer,
  getProductByIdRecLayer,
  getAllProducts,
  getProductById,
  insertProduct,
  updateProduct,
  deleteProduct,
  getRandomTenProducts,
  getAllProductsRecLayerFiltered
};
