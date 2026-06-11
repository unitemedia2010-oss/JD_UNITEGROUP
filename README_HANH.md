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


## Candidate V10 - Sửa ảnh GitHub không hiện

- Đã đổi đường dẫn gallery từ `img/01.jpg` sang `img/01.JPG` để khớp với file Hạnh upload trên GitHub.
- GitHub Pages phân biệt chữ hoa/thường nên `.jpg` khác `.JPG`.
- Xem thêm `HUONG_DAN_FIX_ANH_GITHUB.md`.


## Candidate V11 - Cập nhật content theo file JD website

- Đã thay nội dung web theo file `Bản sửa JD website.docx`.
- Thay phần giới thiệu thành "Tại sao bạn nên lựa chọn Unite Group?" gồm 4 lý do.
- Cập nhật Quick Match, phần công việc, Career Path, Culture Gallery, Workplace, FAQ và Apply Now.
- Cập nhật danh sách chi nhánh theo nội dung mới: DFC, KSC & MVC, EVO, DOC 1, CTC, TBC & TSC, PNC, BTC 1.
- Giữ các chức năng đã có: upload CV, lưu link CV vào Sheet/Drive, popup loading/success, bỏ clipboard, ảnh GitHub `.JPG`.


## Candidate V12 - Tối ưu xuống dòng + nút ứng tuyển xuyên suốt PC

- Đã chỉnh hero title để các cụm có nghĩa đi cùng nhau:
  - "Kinh doanh"
  - "Bất động sản"
  - "cho thuê"
- Thêm `text-wrap: balance` cho heading để xuống dòng tự nhiên hơn.
- Thêm nút `Ứng tuyển ngay` trên header desktop.
- Thêm thanh menu nổi xuyên suốt màn hình PC: Công việc, Thu nhập, Lộ trình, Chi nhánh, Ứng tuyển ngay.
- Mobile vẫn giữ CTA riêng ở dưới màn hình, không hiện dock PC để tránh rối.


## Candidate V13 - Menu nổi chỉ hiện sau khi lướt

- Đã làm gọn header trên PC để không bị lệch/rối.
- Ẩn menu chữ trên header desktop, chỉ giữ logo, nút Ứng tuyển ngay và đổi mode.
- Menu nổi phía dưới sẽ không hiện ngay khi mới vào trang.
- Khi ứng viên lướt xuống qua hero, menu nổi sẽ bay lên mượt.
- Mobile vẫn giữ CTA dưới màn hình, không dùng menu nổi PC.


## Candidate V14 - Sửa menu trên và menu nổi

- Đã bật lại menu trên header desktop.
- Căn menu trên vào giữa header, tránh lệch với logo và nút ứng tuyển.
- Menu nổi phía dưới vẫn ẩn khi mới vào trang.
- Khi ứng viên lướt xuống khoảng 140px, menu nổi sẽ bay lên.
- Mobile vẫn ẩn menu desktop, giữ CTA mobile để giao diện gọn.
