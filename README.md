# 🛒 Shoppee Mini - Ecommerce App

Một ứng dụng web thương mại điện tử đầy đủ tính năng, được xây dựng như một phần của dự án học thuật, mô phỏng trải nghiệm mua sắm trực tuyến.

**Link Repository:** [https://github.com/Hung106/Ecommerce-App](https://github.com/Hung106/Ecommerce-App)

## 🌟 Giới thiệu

Shoppee Mini là một nền tảng thương mại điện tử được thiết kế để cung cấp trải nghiệm mua sắm trực tuyến liền mạch cho người dùng. Dự án này bao gồm các chức năng thiết yếu từ phía khách hàng như duyệt sản phẩm, quản lý giỏ hàng, thanh toán, đến các công cụ quản lý cho người bán. Dự án được phát triển chủ yếu với Microsoft SQL Server và kiến trúc MVC.

## ✨ Tính năng Nổi bật

### 👨‍💼 Dành cho Khách hàng

* **Xác thực & Tài khoản:** Đăng ký, Đăng nhập, Quản lý hồ sơ cá nhân.
* **Duyệt & Tìm kiếm Sản phẩm:**
    * Xem danh sách sản phẩm, chi tiết sản phẩm.
    * Tìm kiếm sản phẩm bằng từ khóa.
    * Lọc sản phẩm theo danh mục.
* **Giỏ hàng:**
    * Thêm/xóa sản phẩm vào giỏ.
    * Cập nhật số lượng.
* **Thanh toán & Đơn hàng:**
    * Quy trình thanh toán an toàn (mô phỏng).
    * Áp dụng voucher giảm giá.
    * Chọn đơn vị vận chuyển.
    * Theo dõi lịch sử đơn hàng và trạng thái đơn hàng.
* **Tương tác:** Đánh giá sản phẩm (dành cho người đã mua).

### 🛍️ Dành cho Người bán (Seller)

* **Quản lý Đơn hàng:**
    * Xem danh sách đơn hàng.
    * Cập nhật trạng thái đơn hàng (chờ xử lý, đang giao, đã giao, hủy đơn).
* **Quản lý Sản phẩm:**
    * Thêm sản phẩm mới với đầy đủ thông tin (hình ảnh, mô tả, giá, tồn kho, biến thể màu sắc/kích thước).
    * Xem, Sửa, Xóa sản phẩm hiện có.
    * Lọc sản phẩm trong trang quản lý.

### ⚙️ Kỹ thuật & Hệ thống

* **Cơ sở dữ liệu:** Tối ưu hóa với Stored Procedures và Triggers trên SQL Server để đảm bảo tính toàn vẹn và logic nghiệp vụ.
* **Kiến trúc MVC:** Phân tách rõ ràng Model, View, và Controller.
* **Transaction Handling:** Mô phỏng cơ chế transaction trong quy trình thanh toán với giới hạn thời gian.

## 🛠️ Công nghệ sử dụng

* **Frontend:** ReactJS
* **Backend:** Node.js
* **Cơ sở dữ liệu:** Microsoft SQL Server, MongoDB
* **Quản lý phiên bản:** Git & GitHub

## 🚀 Bắt đầu

Để chạy dự án này trên máy cục bộ của bạn, hãy làm theo các bước sau:

### Điều kiện tiên quyết

* Node.js
* npm (hoặc yarn)
* Microsoft SQL Server và SQL Server Management Studio (SSMS)
* Git

### Cài đặt

1.  **Clone a repo:**
    ```bash
    git clone [https://github.com/Hung106/Ecommerce-App.git](https://github.com/Hung106/Ecommerce-App.git)
    cd Ecommerce-App
    ```

2.  **Thiết lập Cơ sở dữ liệu (SQL Server):**
    * Mở SSMS, kết nối đến SQL Server instance của bạn.
    * Tạo một database mới (ví dụ: `ShoppeeMiniDB`).
    * Chạy các scripts SQL cần thiết để tạo bảng và các đối tượng (stored procedures, triggers). Tham khảo thiết kế EERD và lược đồ CSDL trong tài liệu dự án.

3.  **Cấu hình Backend:**
    * Di chuyển vào thư mục backend.
    * Tạo file `.env` từ file `.env.example` (nếu có) và cập nhật chuỗi kết nối SQL Server và các biến môi trường khác (ví dụ: `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_DATABASE`, `PORT`).
    * Cài đặt dependencies:
        ```bash
        npm install
        ```
    * Khởi chạy server backend:
        ```bash
        npm start
        # hoặc npm run dev
        ```

4.  **Cấu hình Frontend:**
    * Di chuyển vào thư mục frontend.
    * Cài đặt dependencies:
        ```bash
        npm install
        ```
    * (Nếu cần) Cấu hình file `.env` cho frontend để trỏ tới API backend.
    * Khởi chạy ứng dụng frontend:
        ```bash
        npm start
        # hoặc npm run dev
        ```

5.  **Truy cập ứng dụng:**
    Mở trình duyệt và truy cập `http://localhost:PORT_FRONTEND` (ví dụ: `http://localhost:3000` hoặc `http://localhost:5173`).
