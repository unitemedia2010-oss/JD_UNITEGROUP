# Hướng dẫn bản Candidate V5 - Có upload CV

## Đã chỉnh cho ứng viên đọc

- Xóa nút `Tải poster 4:5`.
- Đổi các câu nội bộ thành ngôn ngữ dành cho ứng viên.
- Thêm trường `Tải CV lên nếu có`.
- CV được lưu vào Google Drive, còn link file CV được lưu vào sheet `Ứng viên`.

## Apps Script URL đang gắn

`"https://script.google.com/macros/s/AKfycbyi2kzSMH_PMZkyP9E-L6FT7VztYSZy_AiNlfW-tJDM44ykNHArmrwnu_PVqZByDJfl-w/exec"`

## Cách cập nhật Apps Script

1. Mở Apps Script.
2. Xóa code cũ.
3. Dán code trong `google-apps-script/Code.gs`.
4. Bấm Save.
5. Chạy hàm `setupSheets` hoặc `taoBangMau`.
6. Google sẽ hỏi quyền Drive vì có chức năng lưu CV. Hạnh bấm cấp quyền.
7. Deploy → Manage deployments → Edit → New version → Deploy.

## Sheet `Ứng viên` sẽ có thêm cột

- Tên file CV
- Link file CV

## Có lưu file CV trực tiếp trong Sheet được không?

Không nên lưu file trực tiếp vào ô Sheet. Cách đúng là lưu file lên Google Drive, sau đó Sheet lưu link file. Bản này đã làm theo hướng đó.
