const express = require("express");
const router = express.Router();
const cartCtrl = require('../controllers/cart')

router.post('/add/:id', cartCtrl.addToCart)
router.delete('/rm/:id', cartCtrl.removeFromCart)
router.get('/get/:id', cartCtrl.getCartItems)
module.exports=router