const express = require("express");
const router = express.Router();
const prodCtrl = require("../controllers/category");

router.get('/', prodCtrl.getAllCategories)
router.get('/:id', prodCtrl.getCategoryById)
router.post('/', prodCtrl.insertCategory)

module.exports=router