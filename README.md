# 🚗 EVShare 3D - Hệ thống Quản lý Đồng sở hữu và Chia sẻ Chi phí Xe điện

EVShare là nền tảng quản lý xe điện dùng chung, cung cấp các tính năng từ Đặt lịch thông minh (Smart Booking), Báo cáo chi phí (Cost Chart), Quản lý nhóm đồng sở hữu, cho đến Tính toán cổ phần và biểu quyết.
**Đặc biệt:** Ứng dụng tích hợp công nghệ **Web 3D tương tác** và hệ thống bảo mật cấp doanh nghiệp với **JWT (JSON Web Token)**.

Dự án được thiết kế với kiến trúc Frontend ReactJS (Vite, Tailwind, React Three Fiber) và Backend Java Spring Boot (với MySQL, JPA).

---

## 🛠️ Yêu cầu môi trường (Tài nguyên cần tải)

Để chạy được dự án, máy tính của bạn cần cài đặt sẵn các phần mềm sau. Vui lòng tải và cài đặt nếu máy bạn chưa có:

1. **Java Development Kit (JDK 17 trở lên)**
   - Link tải: [Eclipse Adoptium (Temurin 17 hoặc 21)](https://adoptium.net/)
   - Dùng để chạy môi trường Backend (Spring Boot).
2. **Node.js & npm (Phiên bản 18.x trở lên)**
   - Link tải: [Node.js Official](https://nodejs.org/)
   - Cần thiết để tải các gói thư viện và chạy Frontend (Vite).
3. **MySQL Server (Phiên bản 8.x)**
   - Link tải: [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - Hoặc có thể cài đặt thông qua bộ [XAMPP](https://www.apachefriends.org/index.html).
4. **IDE (Môi trường lập trình)**
   - Backend: [IntelliJ IDEA Community](https://www.jetbrains.com/idea/download/) (Khuyên dùng) hoặc Eclipse.
   - Frontend: [Visual Studio Code](https://code.visualstudio.com/).

---

## ⚙️ Bước 1: Cài đặt Cơ sở dữ liệu (Database MySQL)

1. Mở công cụ quản lý MySQL của bạn (VD: MySQL Workbench, DBeaver, hoặc phpMyAdmin trong XAMPP).
2. Chạy câu lệnh tạo Database mới:
   ```sql
   CREATE DATABASE evshare DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Mở file cấu hình Backend tại `backend/src/main/resources/application.properties`.
4. Đảm bảo cấu hình Username và Password khớp với máy của bạn:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/evshare?createDatabaseIfNotExist=true&useSSL=false
   spring.datasource.username=root
   spring.datasource.password=mật_khẩu_của_bạn (để trống nếu dùng XAMPP)
   ```

---

## 🚀 Bước 2: Hướng dẫn khởi chạy Backend (Spring Boot)

1. Mở thư mục `backend` bằng **IntelliJ IDEA**.
2. Đợi IDE tự động tải các thư viện (Dependencies) qua Maven. Quá trình này có thể mất vài phút cho lần đầu.
3. Chạy ứng dụng bằng 1 trong 2 cách:
   - **Cách 1 (Dùng IDE):** Tìm file `BackendApplication.java` (trong `src/main/java/com/evshare/backend/`) -> Nhấn nút **Run** (mũi tên màu xanh lá).
   - **Cách 2 (Dùng Terminal):** Mở terminal tại thư mục `backend` và gõ lệnh:
     ```bash
     .\mvnw.cmd spring-boot:run
     ```
4. Khi thấy dòng chữ `Tomcat started on port 8080`, Backend đã khởi chạy thành công tại địa chỉ: `http://localhost:8080`.
   *(Trong lần chạy đầu tiên, hệ thống sẽ tự động tạo các bảng trong CSDL)*.

---

## 🎨 Bước 3: Hướng dẫn khởi chạy Frontend (ReactJS)

1. Mở thư mục `frontend` bằng phần mềm **Visual Studio Code**.
2. Mở cửa sổ Terminal trong VS Code (chọn Menu `Terminal` -> `New Terminal` hoặc nhấn `` Ctrl + ` ``).
3. **Cài đặt các gói thư viện (Bắt buộc chạy lần đầu):**
   Gõ lệnh sau và nhấn Enter để máy tải các gói React, Tailwind, JWT, và thư viện 3D (`@react-three/fiber`):
   ```bash
   npm install
   ```
4. **Khởi chạy giao diện website:**
   Sau khi quá trình cài đặt (install) hoàn tất 100%, gõ lệnh sau để chạy:
   ```bash
   npm run dev
   ```
5. Trên Terminal sẽ xuất hiện một đường link (Thường là `http://localhost:5173`). Bạn hãy giữ `Ctrl` + Click chuột trái vào link đó để mở Website lên trình duyệt.

---

## 👥 Thông tin đăng nhập kiểm thử (Test Accounts)

Sau khi Website được mở lên, bạn có thể tự Đăng ký tài khoản mới, hoặc dùng các tài khoản đã được nạp sẵn để test:

**Tài khoản Quản trị viên (ADMIN):**
Dùng để test tính năng thêm thành viên vào xe và Không gian kiểm tra xe 3D.
- Tên đăng nhập: `admin@evshare.vn`
- Mật khẩu: `admin123`

**Tài khoản Đồng sở hữu (CO-OWNER):**
Dùng để test giao diện theo dõi phần trăm xe, số dư, và đặt lịch xe.
- Tên đăng nhập: `0912345678` (hoặc `mai@evshare.vn`)
- Mật khẩu: `12345678`

---

## 🐛 Xử lý sự cố thường gặp (Troubleshooting)

- **Lệnh `npm dev run` báo lỗi "Unknown command":**
  Lệnh chính xác của Node.js là `npm run dev`. Vui lòng gõ lại lệnh đúng.
- **Lỗi `Web server failed to start. Port 8080 was already in use` (Bên Backend):**
  Đã có tiến trình khác đang chiếm cổng 8080 (bạn vô tình chạy 2 cái Backend cùng lúc). Bạn tắt tiến trình Java cũ bằng cách mở Windows PowerShell và chạy lệnh: `taskkill /F /IM java.exe`, sau đó chạy lại.
- **Lỗi `403 Forbidden` hoặc Blank Screen trên Frontend:**
  Do bộ nhớ trình duyệt của bạn đang lưu trạng thái cũ. Nhấn **F5 (Tải lại trang)**, hệ thống sẽ tự động dọn rác và đưa bạn về trang Đăng nhập để cấp JWT Token mới.
- **Dữ liệu Database bị lỗi hoặc sai:**
  Bạn có thể đổi `spring.jpa.hibernate.ddl-auto=update` thành `create-drop` trong file `application.properties`, chạy lại Backend 1 lần để hệ thống xóa sạch DB cũ và tái tạo lại từ đầu, sau đó đổi lại thành `update`.
