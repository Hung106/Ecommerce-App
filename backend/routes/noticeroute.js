const express = require("express");
const router = express.Router();
const noticeCtrl = require("../controllers/notice")

router.get("/:id", noticeCtrl.getAllNotice)
module.exports = router