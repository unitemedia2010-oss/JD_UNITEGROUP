# Unite Group Career JD - V3 + Sheet tiếng Việt V2

Bản này giữ nguyên nền V3 và bổ sung:
- Logo header to hơn.
- Popup loading nền đen khi gửi form.
- Animation thành công sau khi gửi xong.
- Apps Script mới chỉ lưu về sheet `Ứng viên`.
- Có hàm chuyển dữ liệu cũ từ `Applications` sang `Ứng viên`.
- Có hàm ẩn sheet `Applications` cũ.

Xem hướng dẫn tại `HUONG_DAN_SHEET_TIENg_VIET.md`.


## V3 - Watermark nền logo vuông

- Đã thêm logo vuông siêu to mờ dưới nền web.
- Logo nền dùng `MARKER_URL` (logo vuông gold).
- Có hiệu ứng blur + opacity thấp để nhìn ẩn, sang và không gây rối nội dung.
- Hoạt động cho cả light mode và dark mode.


## V4
- Watermark logo vuông đã chỉnh đứng thẳng, không nghiêng.
- Popup/branch card bỏ tọa độ và dòng mô tả chung.
- Thay bằng địa chỉ thật theo dữ liệu chi nhánh.
- Đã cập nhật APPS_SCRIPT_URL mới.
- Bổ sung tối ưu giao diện điện thoại.


## Candidate V5 - Ngôn ngữ ứng viên + Upload CV

- Đã xóa nút tải poster.
- Đã thay nội dung nội bộ thành cách viết dành cho ứng viên.
- Đã thêm upload CV.
- CV lưu vào Google Drive, Sheet lưu link CV.
- Apps Script cần deploy lại phiên bản mới và cấp quyền Drive.


## Candidate V6 - Fullscreen loading/success

- Đã sửa lại popup gửi form thành overlay toàn màn hình nền đen mờ.
- Khi bấm gửi sẽ hiện loading ở giữa màn hình.
- Khi gửi thành công sẽ hiện animation dấu check và thông báo "Đã gửi thông tin thành công".
- Tối ưu popup cho điện thoại.


## Candidate V7 - Sửa icon thành công và gửi nhanh hơn

- Đã đổi icon thành công sang checkmark CSS ổn định, không còn bị mất icon.
- Đã chuyển form sang chế độ gửi nhanh `no-cors` làm luồng chính để không chờ Apps Script trả JSON.
- Nếu có upload CV, thời gian vẫn phụ thuộc dung lượng file và tốc độ mạng, nhưng sẽ không bị chờ thêm vòng phản hồi CORS.
- Giới hạn CV vẫn là 5MB để tránh gửi quá chậm.


## Candidate V8 - Sửa lỗi localStorage quota

- Đã sửa lỗi: `Failed to execute 'setItem' on 'Storage'... exceeded the quota`.
- Nguyên nhân: trình duyệt không cho lưu nguyên file CV dạng base64 vào localStorage.
- Bản này chỉ lưu cache nhẹ gồm tên, số điện thoại, vị trí, thời gian gửi và trạng thái có CV hay không.
- File CV vẫn được gửi lên Apps Script/Drive như trước.
- Lỗi cache trình duyệt sẽ không làm form báo thất bại nữa.


## Candidate V9 - Bỏ quyền Clipboard

- Đã bỏ toàn bộ lệnh `navigator.clipboard.writeText`.
- Trình duyệt sẽ không còn hỏi quyền “See text and images copied to the clipboard”.
- Form vẫn gửi ứng viên và CV như trước.
- Nội dung ứng viên không còn bị tự động sao chép vào clipboard, tránh gây khó hiểu cho ứng viên.
