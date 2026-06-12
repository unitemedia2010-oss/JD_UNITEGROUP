# Hướng dẫn sửa lỗi mất link file CV trên Sheet - V24

## Lỗi hiện tại

File CV có gửi thành công nhưng Sheet không có link vì Apps Script đang ghi dữ liệu lệch cột.

Dấu hiệu trong Sheet:
- Cột `Tên file CV` lại hiện `career-jd-unitegroup`
- Cột `Link file CV` lại hiện thông tin trình duyệt `Mozilla/...`

Nghĩa là code Apps Script đang append row theo thứ tự cột cũ, thiếu 2 cột:
- `Tên file CV`
- `Link file CV`

## V24 đã sửa gì?

- Apps Script luôn ghi theo tên header, không phụ thuộc vị trí cột.
- File CV lưu lên Google Drive.
- Link file CV ghi đúng vào cột `Link file CV`.
- Giới hạn CV tăng từ 5MB lên 10MB.
- Có hàm `suaLaiHeaderUngVienV24()` để chuẩn hóa lại header.

## Cách cập nhật bắt buộc

1. Mở Apps Script.
2. Xóa toàn bộ code cũ.
3. Dán code mới trong `google-apps-script/Code.gs`.
4. Bấm Save.
5. Chạy hàm `setupSheets`.
6. Chạy thêm hàm `suaLaiHeaderUngVienV24`.
7. Deploy → Manage deployments → Edit.
8. Ở mục Version chọn **New version**.
9. Bấm Deploy.

## Test

Mở link Web App với:

`?action=health`

Kết quả đúng phải có:

`version: V24_CV_LINK_FIXED_10MB`

Sau đó gửi thử một ứng viên có file CV. Sheet `Ứng viên` phải hiện:
- `Tên file CV`
- `Link file CV`
