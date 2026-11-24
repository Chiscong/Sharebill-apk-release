# ShareBill 1.3.7

Bản cài đặt Android chính thức v1.3.7 để tải trực tiếp từ website ShareBill hoặc GitHub Releases.

### Điểm Mới Trong Phiên Bản v1.3.7:
- ⚡ **Bù trừ công nợ tay đôi Pairwise Settlement**: Phân tách rõ ràng nợ phát sinh riêng giữa 2 cá nhân và nợ quỹ chung của cả nhóm, bảo toàn chuẩn xác từng đồng không bị gộp sai lệch.
- 🛠️ **Sửa và xóa khoản chi mới thêm tức thì**: Khắc phục triệt để lỗi kẹt đợt quyết toán cũ (`Settlement Lock`), cho phép thành viên và Chủ nhóm (Owner) chỉnh sửa/xóa khoản chi mới mà không bị chặn nhầm.
- 🚀 **Tối ưu hóa bộ nhớ đệm biểu đồ (Cache Retention)**: Khi quay lại trang Home từ các màn hình khác, biểu đồ chi tiêu và hạn mức được lưu giữ tức thì, không bị giật lag hay phải tải lại từ đầu.
- 🔔 **Mở full thông báo đẩy trên thanh trạng thái**: Hệ thống tự động bắn Notification lên status bar thiết bị khi có cập nhật hoặc biến động ngân sách.
- 🎯 **Đặt hạn mức chi tiêu nhóm chuẩn xác**: Đã sửa lỗi API cập nhật hạn mức và hiển thị phiên bản chuẩn nhất quán trên toàn hệ thống.

### Thông Số Kỹ Thuật:
- Phiên bản: 1.3.7 (build 137).
- Android tối thiểu: 7.0 (API 24).
- Kiến trúc: arm64-v8a, armeabi-v7a, x86_64 trong cùng một APK.
- Package: `com.example.sharebill`.

[Tải APK v1.3.7 Mới Nhất](https://github.com/Chiscong/Sharebill-apk-release/releases/latest/download/sharebill-release.apk)
