const express = require("express");
const router = express.Router();
const prodCtrl = require("../controllers/product");

router.get("/get", prodCtrl.getAllProductsRecLayer)
router.get("/filter", prodCtrl.getAllProductsRecLayerFiltered)
router.get("/get/:id", prodCtrl.getProductByIdRecLayer)
router.get("/random", prodCtrl.getRandomTenProducts)
router.get("/", prodCtrl.getAllProducts);
router.get("/:id", prodCtrl.getProductById);
router.post("/", prodCtrl.insertProduct);
router.put("/:id", prodCtrl.updateProduct);
router.delete("/:id", prodCtrl.deleteProduct);

module.exports = router;
