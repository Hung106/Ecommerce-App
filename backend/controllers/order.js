const connectDB = require("../sqlConfig");
const sql = require("mssql");
const { v4: uuidv4 } = require("uuid");
const {createNotice} = require("../controllers/notice");
const { get } = require("../routes/userRoute");
const pendingTransactions = new Map(); 

async function getCustomersOfOrder(order_id) {
  const pool = await connectDB()
  try {
    const res = await pool.request()
      .input("oid", sql.NVarChar(255), order_id)
      .query(`SELECT customer_id FROM orders WHERE order_id = @oid`)
    return res.recordset[0]
  } catch (error) {
    return -1
  }
}

async function applyVoucher(id, lstItems, total_price) {
  const pool = await connectDB()
  const transaction = new sql.Transaction(pool)
  try {
    await transaction.begin()
    const rq = new sql.Request(transaction)
    const date = new Date()
    const voucher = await rq
      .input("id", sql.Int, id)
      .input("max", sql.Decimal(10, 2), total_price)
      .input("date", sql.DateTime, date)
      .query(`SELECT * FROM promotions 
                      WHERE promotion_id = @id 
                      AND remain_numbers > 0
                      AND min_spend <= @max
                      AND @date BETWEEN valid_start AND valid_end
                      `)
    if (voucher.recordset.length <= 0) return 0;
    console.log("Voucher List: " + voucher.recordset)
    const choseVoucher = voucher.recordset[0]
    switch (choseVoucher.type) {
      case 'all':
        console.log("Check all")
        await rq
          .input("id12", sql.Int, id)
          .query(`UPDATE promotions SET remain_numbers = remain_numbers - 1 WHERE promotion_id = @id12`)
        await transaction.commit()
        return (choseVoucher.discount_type === 'percent'
          ? Math.min(total_price * choseVoucher.discount_rate / 100, choseVoucher.max_discount)
          : choseVoucher.discount_rate)
      case 'category':
        console.log(`Check over category ${choseVoucher.ptype}`)
        const categoryIds = lstItems.map(item => item.category_id);
        if (!categoryIds.includes(choseVoucher.ptype)) return 0;
        else {
          const apply_price = lstItems
            .filter(item => item.category_id === choseVoucher.ptype)
            .map(item => item.paid_price * item.quantity)
            .reduce((acc, curr) => { return acc + curr }, 0)
          await rq
            .input("id11", sql.Int, id)
            .query(`UPDATE promotions SET remain_numbers = remain_numbers - 1 WHERE promotion_id = @id11`)
          await transaction.commit()
          return (choseVoucher.discount_type === 'percent'
            ? Math.min(apply_price * choseVoucher.discount_rate / 100, choseVoucher.max_discount)
            : choseVoucher.discount_rate)
        }
      case 'specific':
        console.log(`Check over specific ${choseVoucher.ptype}`)
        const prod = lstItems.map(item => item.product_id);
        console.log("Product: ", prod)
        if (!prod.includes(choseVoucher.ptype)) return 0;
        console.log("Flag")
        await rq
          .input("id1", sql.Int, id)
          .query(`UPDATE promotions SET remain_numbers = remain_numbers - 1 WHERE promotion_id = @id1`)
        await transaction.commit()
        const apply_price = lstItems
          .filter(item => item.product_id === choseVoucher.ptype)
          .map(item => item.paid_price * item.quantity)
          .reduce((acc, curr) => { return acc + curr }, 0)
        console.log("Apply price: ", apply_price)
        const d1 = (choseVoucher.discount_type === 'percent'
          ? Math.min(apply_price * choseVoucher.discount_rate / 100, choseVoucher.max_discount)
          : choseVoucher.discount_rate)
        console.log("Discount: ", d1)
        return d1
    }
    await transaction.commit()
    return 0;
  } catch (error) {
    await transaction.rollback();
    console.error("applyVoucher Error:", error);
    throw new Error(error.message);
  }
}

async function CreateOrder(req, res) {
  const pool = await connectDB()
  const transaction = new sql.Transaction(pool)
  try {
    await transaction.begin()
    const rq = new sql.Request(transaction)
    const {
      customer_id,
      shipment_id,
      promotion_id,
      payment_method,
      lstItems
    } = req.body
    console.log(lstItems)
    console.log("CreateOrder", {
      customer_id: customer_id,
      shipment_id: shipment_id,
      payment_method: payment_method,
      promotion_id: promotion_id,
      lstItems: lstItems
    })

    if (
      !customer_id ||
      !shipment_id ||
      !payment_method ||
      !lstItems || lstItems.length <= 0
    ) {
      return res.status(400).json({ error: "Invalid Input" });
    }
    const oid = uuidv4()
    const date = new Date()
    const total_price = lstItems.reduce((acc, curr) => {
      return acc + curr.paid_price * curr.quantity
    }, 0)
    const total_quantity = lstItems.reduce((acc, curr) => {
      return acc + curr.quantity
    }, 0)
    console.log("Total Price: ", total_price)
    console.log("Total Quantity: ", total_quantity)
    var discount = 0
    if (promotion_id) discount = await applyVoucher(promotion_id, lstItems, total_price) || 0
    console.log("Discount: ", discount)
    console.log("Order", {
      oid: oid,
      date: date,
      cid: customer_id,
      sid: shipment_id,
      payM: payment_method,
      total_price: total_price,
      final_price: total_price - discount,
      quantity: total_quantity
    })
    const OrderHolding = {
      oid: oid,
      date: date,
      cid: customer_id,
      sid: shipment_id,
      payM: payment_method,
      total_price: total_price,
      final_price: total_price - discount,
      quantity: total_quantity
    }
    await rq
      .input("oid", sql.NVarChar(50), OrderHolding.oid)
      .input("date", sql.DateTime, OrderHolding.date)
      .input("cid", sql.NVarChar(50), OrderHolding.cid)
      .input('sid', sql.NVarChar(50), OrderHolding.sid)
      .input('payM', sql.NVarChar(50), OrderHolding.payM)
      .input("total", sql.Decimal(10, 2), OrderHolding.total_price)
      .input('price', sql.Decimal(10, 2), OrderHolding.final_price)
      .input('q', sql.Int, OrderHolding.quantity)
      .query(`
      INSERT INTO orders (order_id, date_ordered, payment_method, status, customer_id, shipment_id, product_numbers, total_cost, final_price)
      VALUES(@oid, @date, @payM, 'pending', @cid, @sid, @q, @total, @price)
    `)
    for (let i in lstItems) {
      const item = lstItems[i]
      const itemReq = new sql.Request(transaction);
      const checkStock = await itemReq
        .input("pid", sql.NVarChar(50), item.product_id)
        .input("c", sql.NVarChar(50), item.color)
        .input("s", sql.NVarChar(100), item.size)
        .input("q", sql.Int, item.quantity)
        .query(`SELECT * FROM product_size
              WHERE product_id = @pid AND color= @c
              AND size = @s AND stock >= @q  
      `)
      console.log("Check Stock: ", checkStock.recordset)
      if (checkStock.recordset.length <= 0) {
        await transaction.rollback()
        return res.status(400).json({ message: `Product ${item.product_id} is out of stock!` })
      }
      await itemReq
        .input("order_id", sql.NVarChar(50), oid)
        .input("product_id", sql.NVarChar(50), item.product_id)
        .input("color", sql.NVarChar(50), item.color)
        .input("size", sql.NVarChar(100), item.size)
        .input("paid_price", sql.Decimal(10, 2), item.paid_price)
        .input("quantity", sql.Int, item.quantity).query(`
        INSERT INTO includes (
          order_id, product_id, color, size, paid_price, quantity
        ) VALUES (
          @order_id, @product_id, @color, @size, @paid_price, @quantity
        )
      `);

      await itemReq
        .input("product_id1", sql.NVarChar(50), item.product_id)
        .input("color1", sql.NVarChar(50), item.color)
        .input("size1", sql.NVarChar(100), item.size)
        .input("quantity1", sql.Int, item.quantity)
        .query(`
        UPDATE product_size 
        SET stock = stock - @quantity1,
            sold = sold + @quantity1
        WHERE product_id = @product_id1
          AND color = @color1 AND size = @size1
      `)
    }
    const timeout = setTimeout(async () => {
      try {
        await transaction.rollback();
        console.log(`Transaction ${oid} rolled back due to timeout`);
      } catch (err) {
        console.error('Rollback failed (timeout):', err.message);
      } finally {
        pendingTransactions.delete(oid);
      }
    }, 90000); // 30s timeout

    pendingTransactions.set(oid, { transaction, timeout });

    //await transaction.commit()
    //const note = await createNotice(customer_id, `Order ${oid} has been created`)
    res.status(200).json({ order_id:oid, total_price: total_price, discount: discount})
  } catch (error) {
    console.log("CreateOrder Error:", error);
    await transaction.rollback()
    return res.status(500).json({ message: error.message })
  }
}

async function ConfirmOrder(req, res) {
  const { oid } = req.params;
  const pending = pendingTransactions.get(oid);

  if (!pending) {
    return res.status(400).json({ message: "Transaction not found or already timed out." });
  }

  const { transaction, timeout } = pending;

  clearTimeout(timeout);
  pendingTransactions.delete(oid);

  try {
    await transaction.commit();
    res.status(200).json({ message: "Transaction confirmed and committed." , order_id: oid});
  } catch (err) {
    console.error("ConfirmOrder error:", err.message);
    res.status(500).json({ message: "Failed to confirm transaction." });
  }
}

// Lấy tất cả đơn hàng
async function getAllOrders(req, res) {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM orders");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getAllOrdersByCustomer(req, res) {
  try {
    const pool = await connectDB();
    const { customer_id } = req.params;
    const result = await pool.request()
    .input("customer_id", sql.NVarChar(50), customer_id)
    .query("SELECT * FROM orders WHERE customer_id = @customer_id");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Lấy đơn hàng theo ID, kèm chi tiết sản phẩm
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const order = await pool
      .request()
      .input("order_id", sql.NVarChar(50), id)
      .query("SELECT * FROM orders WHERE order_id=@order_id");
    if (!order.recordset.length)
      return res.status(404).json({ error: "Order not found" });

    const items = await pool.request().input("order_id", sql.NVarChar(50), id)
      .query(`
        SELECT i.product_id, p.title, i.color, i.size, i.quantity, i.paid_price
        FROM includes i
        JOIN products p ON i.product_id=p.product_id
        WHERE i.order_id=@order_id
      `);

    res.json({ order: order.recordset[0], items: items.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

//Cập nhật đơn hàng (status, payment_method, shipment_id)
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { status, payment_method, shipment_id } = req.body;
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("order_id", sql.NVarChar(50), id)
      .input("status", sql.NVarChar(50), status)
      .input("payment_method", sql.NVarChar(50), payment_method)
      .input("shipment_id", sql.NVarChar(50), shipment_id).query(`
        UPDATE orders SET
          status = COALESCE(@status, status),
          payment_method = COALESCE(@payment_method, payment_method),
          shipment_id = COALESCE(@shipment_id, shipment_id)
        WHERE order_id = @order_id
      `);
    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ error: "Order not found" });
    const cid = await getCustomersOfOrder(id)
    const note = await createNotice(cid.customer_id, `Order ${id} is now ${status}. Shipment is now ${shipment_id}`)
    res.json({ message: "Order updated successfully", note: note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function RejectOrderBySeller(req, res){
  const pool = await connectDB()
  const transaction = new sql.Transaction(pool)
  
  try {
    await transaction.begin()
    const {id} = req.params
    const rq = new sql.Request(transaction)
    const order = await rq
      .input("order_id", sql.NVarChar(50), id)
      .query("SELECT * FROM orders WHERE order_id=@order_id");
    
    const items = await rq
      .query(`
        SELECT i.product_id, p.title, i.color, i.size, i.quantity, i.paid_price
        FROM includes i
        JOIN products p ON i.product_id=p.product_id
        WHERE i.order_id=@order_id
      `);
    await rq 
    .input("id", sql.NVarChar(50), id)
    .query(`UPDATE orders 
            SET status = 'failed'
            WHERE order_id = @id
    `)
    for (let i in items.recordset){
      const item = items.recordset[i]
      const itemReq = new sql.Request(transaction)
      await itemReq
      .input("id", sql.NVarChar(50), item.product_id)
      .input("color", sql.NVarChar(50), item.color)
      .input("size", sql.NVarChar(50), item.size)
      .input("quantity", sql.Int, item.quantity)
      .query(`UPDATE product_size
              SET stock = stock + @quantity, sold = sold - @quantity
              WHERE product_id = @id AND color = @color AND size = @size
      `)
    }
    await transaction.commit()
    const note = await createNotice(order.recordset[0].customer_id, `Order ${id} has been rejected.\nYour money will be refunded in 24h.`)
    res.status(200).json({message: note})
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({message: error.message})
  }
}


async function CancelOrderByCustomer(req, res){
  const pool = await connectDB()
  const transaction = new sql.Transaction(pool)
  
  try {
    await transaction.begin()
    const {id} = req.params
    const rq = new sql.Request(transaction)
    const order = await rq
      .input("order_id", sql.NVarChar(50), id)
      .query("SELECT * FROM orders WHERE order_id=@order_id");
    
    const items = await rq
      .query(`
        SELECT i.product_id, p.title, i.color, i.size, i.quantity, i.paid_price
        FROM includes i
        JOIN products p ON i.product_id=p.product_id
        WHERE i.order_id=@order_id
      `);
    await rq 
    .input("id", sql.NVarChar(50), id)
    .query(`UPDATE orders 
            SET status = 'failed'
            WHERE order_id = @id
    `)
    for (let i in items.recordset){
      const item = items.recordset[i]
      const itemReq = new sql.Request(transaction)
      await itemReq
      .input("id", sql.NVarChar(50), item.product_id)
      .input("color", sql.NVarChar(50), item.color)
      .input("size", sql.NVarChar(50), item.size)
      .input("quantity", sql.Int, item.quantity)
      .query(`UPDATE product_size
              SET stock = stock + @quantity, sold = sold - @quantity
              WHERE product_id = @id AND color = @color AND size = @size
      `)
    }
    await transaction.commit()
    const note = await createNotice(order.recordset[0].customer_id, `Order ${id} has been canceled.\nYour money will be refunded in 24h.`)
    res.status(200).json({message: note})
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({message: error.message})
  }
}

// Xóa đơn hàng và includes liên quan
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    await pool
      .request()
      .input("order_id", sql.NVarChar(50), id)
      .query("DELETE FROM includes WHERE order_id=@order_id");
    const result = await pool
      .request()
      .input("order_id", sql.NVarChar(50), id)
      .query("DELETE FROM orders WHERE order_id=@order_id");
    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrder,
  CreateOrder,
  deleteOrder,
  CancelOrderByCustomer,
  RejectOrderBySeller, ConfirmOrder, getAllOrdersByCustomer
};