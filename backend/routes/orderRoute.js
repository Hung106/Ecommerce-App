const express = require("express");
const router = express.Router();
const orderCtrl = require("../controllers/order");

// Mua ngay: tạo đơn, thêm includes, trigger sẽ cập nhật số lượng, giá tiền
router.post("/buy", orderCtrl.CreateOrder);
router.post("/confirm/:oid", orderCtrl.ConfirmOrder)
router.get("/", orderCtrl.getAllOrders);
router.get("/:id", orderCtrl.getOrderById);
router.put("/reject/:id", orderCtrl.RejectOrderBySeller)
router.put("/cancel/:id", orderCtrl.CancelOrderByCustomer)
router.put("/:id", orderCtrl.updateOrder);
router.delete("/:id", orderCtrl.deleteOrder);
router.get("/customer/:customer_id", orderCtrl.getAllOrdersByCustomer)
module.exports = router;
