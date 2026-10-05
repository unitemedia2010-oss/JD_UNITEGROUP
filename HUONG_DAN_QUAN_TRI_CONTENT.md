# Quản trị nội dung 3 trang

Mở https://unitemedia2010-oss.github.io/JD_UNITEGROUP/admin.html. Chọn Căn hộ, Nhà nguyên căn hoặc TPA; bấm chữ trong bản xem trước, gõ trực tiếp, rồi bấm **Lưu nội dung**. Số thứ tự, tiêu đề, mô tả, nút, nhãn biểu mẫu, FAQ, chân trang và chữ nhỏ đều có thể chọn. Những mục khó bấm như lựa chọn trong danh sách, chữ gợi ý nhập liệu và thông báo kết quả trắc nghiệm ẩn có trong mục **Tìm chữ cần sửa** bên phải. Nút Lưu chỉ báo thành công khi đọc lại được đúng nội dung từ tab Web_Content.

## Kích hoạt nút Lưu

1. Mở dự án Apps Script hiện dùng cho form ứng tuyển. File google-apps-script/Code.gs trong repo là bản V32 đã ghép trực tiếp từ mã V30 bạn gửi, có đầy đủ CMS, Training và xác nhận đã lưu hồ sơ. Thay nội dung Mã.gs bằng file V32 này và lưu.
2. Trong **Project Settings → Script properties**, thêm thuộc tính CMS_ADMIN_PASSWORD với một mật khẩu riêng, ít nhất 12 ký tự. Không ghi mật khẩu vào GitHub hay file HTML. Bước này phải do chủ tài khoản thực hiện.
3. Lưu, rồi **Deploy → Manage deployments → Edit → New version → Deploy**. Giữ deployment hiện tại để URL /exec trong ba file config không đổi.
4. Mở URL /exec?action=health; kết quả cần có version V32_CMS_FORM_ACK và cmsReady true. Sau đó mở admin.html, nhập mật khẩu vừa đặt và thử sửa một chữ không ảnh hưởng nội dung quan trọng. Xem thông báo xác nhận, tải lại trang công khai và kiểm tra.

Google Sheet Web_Content vẫn là nơi lưu dữ liệu, nhưng nhân viên content làm việc trên trang quản trị. Nếu tab này bị xóa, lần lưu tiếp theo sẽ tạo lại tab cùng hàng tiêu đề. Không cần dán lại toàn bộ CMS_Template.csv: khi lưu một vị trí mới, hệ thống tự thêm hàng tương ứng. Các giá trị được tính tự động (như thu nhập) và dữ liệu từ tab Training, Chi nhánh, Hình ảnh văn hóa được cập nhật ở nguồn dữ liệu tương ứng.

## Tình trạng dữ liệu Training

Tab Training hiện chỉ có tiêu đề tuần và hàng tên cột. Web hiển thị “HR chưa cập nhật lịch Training” cho đến khi có hàng ngày/buổi hợp lệ. Trang quản trị này chỉ sửa nội dung chữ; lịch Training vẫn được HR nhập tại tab riêng.
