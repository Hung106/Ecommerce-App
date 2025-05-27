// routes/userRoute.js
const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/user");
const {
  auth,
  sellerAuth,
  customerAuth,
  roleAuth,
} = require("../middlewares/auth");
router.get("/", usersCtrl.getAllUsers);
router.get("/:id", usersCtrl.getUserById);
router.post("/", usersCtrl.createUser);
router.put("/:id", usersCtrl.updateUser);
router.delete("/:id", usersCtrl.deleteUser);

module.exports = router;
