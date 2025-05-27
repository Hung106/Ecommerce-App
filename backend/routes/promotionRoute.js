const express = require("express");
const promotionController = require("../controllers/promotion");
const router = express.Router();

router.post("/", promotionController.getAllPromotions);
router.get("/:id", promotionController.GetPromotionsBySellers);
router.post("/", promotionController.CreatePromotions);
router.put("/:id", promotionController.CreatePromotions);
router.delete("/:id", promotionController.DeletePromotions);

module.exports = router;