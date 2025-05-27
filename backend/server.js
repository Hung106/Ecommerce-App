require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./sqlConfig");
const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute");
const orderRoutes = require("./routes/orderRoute");
const authRoutes = require("./routes/authRoute");
const noticeRotes = require("./routes/noticeroute")
const cartRoutes = require("./routes/cartRoute")
const reviewRoutes = require("./routes/reviewRoute")
const promoRoutes = require('./routes/promotionRoute')
const cateRoutes = require('./routes/cateRoute')

const app = express();
const port = process.env.PORT || 8080;

// Kết nối với cơ sở dữ liệu khi ứng dụng khởi động
connectDB()
  .then(() => {
    console.log("Connected to the database");

    app.use(bodyParser.json());
    app.use(cors());
    // Định nghĩa các route cho ứng dụng
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/notice", noticeRotes)
    app.use("/api/cart", cartRoutes)
    app.use("/api/review", reviewRoutes)
    app.use('/api/voucher', promoRoutes)
    app.use("/api/auth", authRoutes)
    app.use("/api/cate", cateRoutes)
    app.get("/", (req, res) => {
      res.send("Welcome to the E-commerce API!");
    });
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });
