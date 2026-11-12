# ShareBill APK Releases

Repo công khai để phân phối file cài đặt Android của ShareBill. Mã nguồn Flutter và backend được quản lý riêng.

## Tải ứng dụng

- [Tải APK mới nhất](https://github.com/Chiscong/Sharebill-apk-release/releases/latest/download/sharebill-release.apk)
- [Xem release và checksum](https://github.com/Chiscong/Sharebill-apk-release/releases/latest)

Không cần đăng nhập GitHub. Tên file phát hành luôn là `sharebill-release.apk`, nên website và QR giữ nguyên URL cho các bản mới.

## File trong repo

`artifacts/` lưu bản APK đã chuẩn bị, `release.json` mô tả chính xác phiên bản, Android tối thiểu, kiến trúc và dung lượng; `SHA256SUMS` chứa checksum SHA-256. Repo này lưu bản nhị phân để workflow xuất bản được bằng quyền Git hiện có, không cần lưu personal access token trên máy hoặc trong mã nguồn.

Không đưa `.env`, khóa ký, keystore hay secret vào repo này. APK không được đóng gói lại hoặc đổi khóa ký bởi script phát hành.

## Chuẩn bị bản mới

1. Build APK từ project Flutter. Tăng version name cho mỗi release mới và tăng build number để Android nhận bản cập nhật. Build với các kiến trúc `android-arm,android-arm64,android-x64` để có một file dùng chung.
2. Chạy từ repo phát hành, dùng đường dẫn đến APK và Android SDK trên máy của bạn:

```bash
node scripts/prepare-apk.mjs --file /path/to/app-release.apk --aapt /path/to/Android/Sdk/build-tools/VERSION/aapt
python3 scripts/verify-release.py
```

3. Cập nhật `RELEASE_NOTES.md`, kiểm tra chữ ký bằng `apksigner verify --verbose artifacts/sharebill-release.apk`, rồi commit APK và metadata cùng nhau.
4. Tạo annotated tag có dạng `v<versionName>` khớp với `artifacts/release.json`, rồi push commit và tag. Ví dụ bản đầu tiên:

```bash
git push origin main
git tag -a v1.0.0 -m "ShareBill Android 1.0.0"
git push origin v1.0.0
```

Workflow `Publish Android APK` kiểm tra tag, checksum, dung lượng và kiến trúc, sau đó tạo GitHub Release với APK, metadata và checksum. Workflow chỉ chạy khi push tag `v*`, dùng token do GitHub Actions cấp và quyền `contents: write`. Không thay hoặc ghi đè tag/release đã phát hành; bản sau dùng version và tag mới.

Chờ workflow thành công và thử tải ở chế độ không đăng nhập trước khi thông báo bản mới cho người dùng.

## Website ShareBill

Trong `.env` của website hoặc Environment Variables của Vercel:

```env
VITE_APK_DOWNLOAD_URL=https://github.com/Chiscong/Sharebill-apk-release/releases/latest/download/sharebill-release.apk
VITE_DOWNLOAD_METADATA_URL=
```

Không dùng metadata backend cùng URL APK GitHub. Website có thể tải file mà không gọi API ứng dụng. Sau khi đổi biến, khởi động lại dev server hoặc Redeploy trên Vercel.
