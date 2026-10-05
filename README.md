# Trạm Y Tế Merge V4.2

Bản V4.2 thay giao diện trang chủ và màn hình chơi theo phong cách quầy tiếp đón y tế.
Giữ bộ vật phẩm V4, cấu hình vật lý, dữ liệu lưu, nhiệm vụ và giá trang phục.

## Chạy mã nguồn

```sh
npm ci
npm run dev
```

## Kiểm tra và build

```sh
npm run lint
npm run build
```

Vercel dùng Vite, lệnh build `npm run build`, thư mục xuất `dist`.
Xem `HUONG-DAN-V4.2.txt` để test và cập nhật. Ảnh chụp kiểm tra nằm trong `kiem-tra-giao-dien`.

Màn hình chơi dùng lớp tranh từ mẫu duyệt, với các nút và số liệu thật. Đã sửa lỗi tỷ lệ hình khi hàm vẽ được gọi trong giây đầu khởi động.

V4.2 thêm giai điệu trang chủ tự soạn bằng Web Audio và animation trang trí nhẹ. Chạm lần đầu để mở âm thanh; tắt nhạc trong Cài đặt. Nhạc dừng khi chuyển nền, đổi giai điệu theo cảnh và không tải tệp ngoài.
