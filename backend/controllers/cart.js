const connectDB = require("../sqlConfig");
const sql = require("mssql");
const {checkIfTableExists} = require("./helper");

async function createTable() {
    try {
        const pool = await connectDB()
        await pool.request()
        .query(`
            CREATE TABLE cart (
                id INT IDENTITY(1,1) PRIMARY KEY,
                customer_id NVARCHAR(50) NOT NULL,
                product_id NVARCHAR(50) NOT NULL,
                color NVARCHAR(50) NOT NULL,
                size NVARCHAR(100) NOT NULL,
                paid_price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL,
                
                CONSTRAINT FK_cart_customer FOREIGN KEY (customer_id)
                    REFERENCES customers(user_id)
                    ON DELETE CASCADE,

                CONSTRAINT FK_cart_product FOREIGN KEY (product_id, color, size)
                    REFERENCES product_size(product_id, color, size)
                    ON DELETE CASCADE
            );
            `)
    } catch (error) {
        return -1
    }
}

async function checkIfProductExist(id, product_id, color, size) {
    try {
        const pool = await connectDB()
        const checkout = await pool.request()
                        .input("id", sql.NVarChar(50), id)
                        .input("product_id", sql.NVarChar(50), product_id)
                        .input("color", sql.NVarChar(50), color)
                        .input("size", sql.NVarChar(100), size)
                        .query(`SELECT * FROM cart 
                            WHERE customer_id = @id
                                AND product_id = @product_id 
                                AND color = @color
                                AND size = @size
                            `)
        return (checkout).recordset.length > 0
    } catch (error) {
        return -1
    }
}

async function addToCart(req, res){
    const pool = await connectDB()
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin()
        const request = new sql.Request(transaction);
        const checkout = await checkIfTableExists("cart")
        if (!checkout) {
            const cre = await createTable()
            if (cre === -1) return res.status(400).json({message: "Network corrupted"})
        }
        const id = req.params.id
        const {product_id, color, size, paid, quantity} = req.body
        const checkup = await checkIfProductExist(id, product_id, color, size)
        if (checkup === -1) return res.status(400).json({message: "Error checking"})
        if (checkup){
            const sql_ = await request
                        .input("customer_id", sql.NVarChar(50), id)
                        .input("product_id", sql.NVarChar(50), product_id)
                        .input("color", sql.NVarChar(50), color)
                        .input("size", sql.NVarChar(100), size)
                        .input("quantity", sql.Int, quantity)
                        .query(`UPDATE cart 
                            SET quantity = quantity + @quantity 
                            WHERE customer_id = @customer_id
                                AND product_id = @product_id 
                                AND color = @color
                                AND size = @size`)
            if (sql_.rowsAffected[0] === 0){
                return res.status(400).json({message: "Failed to add products"})
            }
            await transaction.commit()
            return res.status(200).json({message: "Add to cart successfully"})
        }
        const query = await request
        .input("customer_id", sql.NVarChar(50), id)
        .input("product_id", sql.NVarChar(50), product_id)
        .input("color", sql.NVarChar(50), color)
        .input("size", sql.NVarChar(100), size)
        .input("paid_price", sql.Decimal(10,2), paid)
        .input("quantity", sql.Int, quantity)
        .query(`
            INSERT INTO cart (customer_id, product_id, color, size, paid_price, quantity)
            VALUES (@customer_id, @product_id, @color, @size, @paid_price, @quantity)
        `);
        if (query.rowsAffected[0] === 0){
            return res.status(400).json({message: "Failed to add products"})
        }
        await transaction.commit()
        return res.status(200).json({message: "Add to cart successfully"})
    } catch (error) {
        await transaction.rollback()
        return res.status(500).json({message: "Network Error"})
    }
}

// async function removeFromCart(req, res) {
//     const pool = await connectDB();
//     const transaction = new sql.Transaction(pool);
//     try {
//         await transaction.begin();
//         const request = new sql.Request(transaction); // Tạo request một lần và tái sử dụng input
//         const customerId = req.params.id; // Đổi tên biến cho rõ ràng
//         const { lstP, all } = req.body;

//         if (all) {
//             await request
//                 .input("customerIdParam", sql.NVarChar(50), customerId)
//                 .query(`DELETE FROM cart WHERE customer_id = @customerIdParam`);
//         } else {
//             if (lstP && Array.isArray(lstP) && lstP.length > 0) {
//                 for (const productToRemove of lstP) { // Sử dụng for...of để lặp qua mảng
//                     // Xóa và tạo lại input cho mỗi lần query để đảm bảo tính đúng đắn
//                     // Hoặc bạn có thể tạo request mới: const itemRequest = new sql.Request(transaction);
//                     // Nhưng với thư viện mssql, việc input lại thường sẽ ghi đè giá trị cũ của param cùng tên.
//                     await request // Tái sử dụng request object
//                         .input("customerIdParam", sql.NVarChar(50), customerId) // Đảm bảo customerId luôn được input
//                         .input("productIdParam", sql.NVarChar(50), productToRemove.product_id)
//                         .input("colorParam", sql.NVarChar(50), productToRemove.color)
//                         .input("sizeParam", sql.NVarChar(100), productToRemove.size) // Sửa thành NVARCHAR(100)
//                         .query(`
//                             DELETE FROM cart 
//                             WHERE customer_id = @customerIdParam 
//                               AND product_id = @productIdParam
//                               AND color = @colorParam 
//                               AND size = @sizeParam
//                         `);
//                     // Bạn có thể thêm kiểm tra request.rowsAffected[0] ở đây nếu muốn biết mỗi item có được xóa thành công không
//                 }
//             } else if (lstP && (!Array.isArray(lstP) || lstP.length === 0) && !all) {
//                 // Nếu lstP được cung cấp nhưng không phải mảng hợp lệ hoặc rỗng, và không phải xóa tất cả
//                 await transaction.rollback(); // Rollback trước khi trả về lỗi
//                 return res.status(400).json({ message: "Danh sách sản phẩm cần xóa không hợp lệ." });
//             }
//             // Nếu lstP không được cung cấp và all cũng là false, không làm gì cả hoặc trả về lỗi tùy logic.
//             // Hiện tại, nếu lstP không có và all=false, nó sẽ commit mà không xóa gì.
//         }

//         await transaction.commit();
//         return res.status(200).json({ message: "Các sản phẩm đã được xóa khỏi giỏ hàng." });

//     } catch (error) {
//         console.error("Lỗi trong removeFromCart:", error);
//         if (transaction && transaction.active) { // Kiểm tra trước khi rollback
//             try {
//                 await transaction.rollback();
//             } catch (rollbackError) {
//                 console.error("Lỗi khi rollback transaction:", rollbackError);
//             }
//         }
//         return res.status(500).json({ message: "Lỗi máy chủ khi xóa sản phẩm.", error: error.message });
//     }
// }

async function removeFromCart(req, res) {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const customerId = req.params.id;
        const { lstP, all } = req.body;

        if (all) {
            // Nếu yêu cầu xóa toàn bộ giỏ hàng của khách hàng
            const request = new sql.Request(transaction);
            await request
                .input("customerIdParam", sql.NVarChar(50), customerId)
                .query(`DELETE FROM cart WHERE customer_id = @customerIdParam`);
        } else {
            if (lstP && Array.isArray(lstP) && lstP.length > 0) {
                // Nếu yêu cầu xóa một danh sách sản phẩm cụ thể
                for (const productToRemove of lstP) {
                    const itemRequest = new sql.Request(transaction); // tạo request mới cho mỗi sản phẩm
                    await itemRequest
                        .input("customerIdParam", sql.NVarChar(50), customerId)
                        .input("productIdParam", sql.NVarChar(50), productToRemove.product_id)
                        .input("colorParam", sql.NVarChar(50), productToRemove.color)
                        .input("sizeParam", sql.NVarChar(100), productToRemove.size)
                        .query(`
                            DELETE FROM cart 
                            WHERE customer_id = @customerIdParam 
                              AND product_id = @productIdParam
                              AND color = @colorParam 
                              AND size = @sizeParam
                        `);
                }
            } else if (lstP && (!Array.isArray(lstP) || lstP.length === 0) && !all) {
                // Nếu danh sách sản phẩm không hợp lệ mà cũng không yêu cầu xóa tất cả
                await transaction.rollback();
                return res.status(400).json({ message: "Danh sách sản phẩm cần xóa không hợp lệ." });
            }
        }

        await transaction.commit();
        return res.status(200).json({ message: "Các sản phẩm đã được xóa khỏi giỏ hàng." });

    } catch (error) {
        console.error("Lỗi trong removeFromCart:", error);
        if (transaction && transaction._aborted !== true) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Lỗi khi rollback transaction:", rollbackError);
            }
        }
        return res.status(500).json({ message: "Lỗi máy chủ khi xóa sản phẩm.", error: error.message });
    }
}


async function getCartItems(req, res) {
    const pool = await connectDB()
    const transaction = new sql.Transaction(pool)
    try {
        await transaction.begin()
        const request = new sql.Request(transaction)
        const id = req.params.id
        const sql_ = await request
                    .input("id", sql.NVarChar(255), id)
                    .query(`SELECT DISTINCT * FROM cart WHERE customer_id = @id`)
        await transaction.commit()
        return res.status(200).json({data: sql_.recordset})
    } catch (error) {
        return res.status(500).json({message: "Network Error"})
    }
}


module.exports={   
    addToCart,
    removeFromCart, 
    getCartItems
}