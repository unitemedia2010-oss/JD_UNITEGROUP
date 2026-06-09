# HƯỚNG DẪN V3 + SHEET TIẾNG VIỆT V2

## Đã chỉnh trong bản này

- Giữ nguyên giao diện/map của V3.
- Logo công ty trên header to hơn.
- Khi bấm gửi form sẽ có popup nền đen:
  - Đang gửi thông tin
  - Gửi thành công có animation dấu check
- Apps Script chỉ lưu vào sheet `Ứng viên`, không lưu vào `Applications`.

## Vì sao vẫn nhảy vào sheet Applications cũ?

Nếu dữ liệu vẫn vào `Applications`, nghĩa là Apps Script đang chạy phiên bản cũ. Web chỉ gửi data đến URL, còn việc lưu vào sheet nào là do code Apps Script đang deploy quyết định.

## Cách sửa dứt điểm

1. Mở Apps Script.
2. Xóa code cũ.
3. Dán code mới trong `google-apps-script/Code.gs`.
4. Bấm Save.
5. Chọn hàm `taoBangMau` hoặc `setupSheets` → bấm Chạy.
6. Nếu muốn chuyển dữ liệu cũ: chạy `chuyenDuLieuApplicationsCuSangUngVien`.
7. Nếu chỉ muốn ẩn sheet cũ: chạy `anSheetApplicationsCu`.
8. Bấm Triển khai → Quản lý bản triển khai → Chỉnh sửa.
9. Ở mục Phiên bản, chọn **Phiên bản mới**.
10. Bấm Triển khai.

## Link đang gắn trong web

https://script.google.com/macros/s/AKfycbyi2kzSMH_PMZkyP9E-L6FT7VztYSZy_AiNlfW-tJDM44ykNHArmrwnu_PVqZByDJfl-w/exec

## Test nhanh

Mở link sau sau khi deploy:
https://script.google.com/macros/s/AKfycbyi2kzSMH_PMZkyP9E-L6FT7VztYSZy_AiNlfW-tJDM44ykNHArmrwnu_PVqZByDJfl-w/exec?action=health

Kết quả đúng phải có:
`version: VN_SHEET_ONLY_V2`

Nếu không thấy dòng này, Hạnh vẫn đang chạy code cũ.
