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


## Candidate V15 - Áp dụng góp ý mới

- Hero title đổi thành: `Chuyên viên tư vấn cho thuê căn hộ`.
- Calculator thu nhập đổi về rate `50%`.
- Tất cả địa chỉ văn phòng thêm hậu tố `(Quận x cũ)`.
- Section intro:
  - Chữ vàng đổi thành `Why`
  - Chữ trắng đổi thành `Tại sao bạn nên gia nhập Unite Group?`
- Hero card:
  - Đào tạo: `Tham gia training đầu vào, Leader hướng dẫn trực tiếp trong quá trình hoạt động.`
  - Mini stat 1: `TP.HCM / 8 văn phòng làm việc`
  - Mini stat 2: `1-1 / Leader đồng hành`
  - Mini stat 3: `Thu nhập / theo năng lực bản thân`
- Gallery card `Vinh danh kết quả` đổi caption thành:
  `Ghi nhận sự cống hiến của từng cá nhân và tập thể.`
- Timeline cập nhật:
  1. Marketing & Tạo nguồn khách hàng tiềm năng
  2. Tư vấn & Hỗ trợ khách xem phòng
  3. Hỗ trợ ký kết hợp đồng & Chăm sóc khách hàng
- Tông vàng đã giảm độ chói để dễ nhìn hơn ở cả light/dark mode.


## Candidate V16 - 3 mục tuyển dụng + lộ trình đi lên

- Đã đổi phần `Chuyên viên tư vấn / Leader Team / Quản lý chi nhánh` thành 3 ô/nút tuyển dụng riêng.
- Thêm nhãn `Vị trí tuyển dụng` để nhìn rõ đây là 3 nhóm tuyển dụng.
- Đã làm lại `Lộ trình phát triển` theo kiểu từng bậc thang đi lên, có mũi tên `↗` để thể hiện hướng phát triển nghề nghiệp rõ hơn.
- Trên mobile, lộ trình tự chuyển thành dạng dọc để dễ đọc.


## Candidate V18 - Chỉnh màu chữ hero theo ảnh mẫu

- Đã chỉnh màu chữ hero theo ảnh Hạnh gửi:
  - Dark mode: dòng chính màu trắng, dòng dưới màu vàng gold/soft gold.
  - Light mode: dòng chính màu đen, dòng dưới màu vàng gold/soft gold.
- Đã bỏ hiệu ứng gradient cũ trên `h1 span` để không còn bị mảng màu lạ ở cuối chữ.
- Giữ nội dung hero hiện tại: `Chuyên viên tư vấn / cho thuê căn hộ`.


## Candidate V19 - Sửa tràn khung phần lộ trình phát triển

- Đã nới phần chứa `career-journey`.
- Đã tăng khoảng đệm dưới của `journey-track` để card đầu tiên không còn bị tụt ra khỏi khung.
- Giảm nhẹ độ lệch lên/xuống của từng block để bố cục vẫn có cảm giác đi lên nhưng gọn hơn.
- Mobile/tablet vẫn tự chuyển về dạng dọc để không bị tràn.


## Candidate V20 - Sửa mũi tên lộ trình trên giao diện điện thoại

- Đã sửa mũi tên ở phần `Lộ trình phát triển` khi hiển thị dọc trên điện thoại.
- Ở mobile/tablet dạng dọc, mũi tên chéo `↗` được đổi thành mũi tên xuống `↓`.
- Giao diện desktop vẫn giữ mũi tên đi lên để thể hiện hướng phát triển.


## Candidate V21 - Hiệu ứng load trang và xuất hiện khi cuộn/kéo

- Thêm intro khi load/reload trang: màn hình mờ, logo gold, sau đó trang chính xuất hiện mượt.
- Hero title, badge, CTA và card bên phải có animation xuất hiện theo từng nhịp.
- Khi cuộn trên PC hoặc kéo trên mobile, các section/card sẽ fade-up + blur nhẹ rồi hiện ra.
- Có stagger animation cho các nhóm card: Why, Timeline, Gallery, Branch, FAQ, Lộ trình.
- Thêm hiệu ứng nút dạng liquid glass CSS-only, lấy cảm hứng từ component LiquidButton nhưng chạy trực tiếp trên HTML/CSS/JS.
- Tôn trọng `prefers-reduced-motion`: người dùng tắt animation trong hệ điều hành sẽ không bị chạy hiệu ứng.


## Candidate V22 - Gold Shader Animation

- Đã thêm hiệu ứng shader animation nền hero, chuyển từ ý tưởng React/Three.js sang HTML/CSS/JS thuần.
- Màu vàng gold là màu chủ đạo.
- Shader chạy bằng Three.js CDN trên GitHub Pages.
- Tối ưu nhẹ:
  - giới hạn pixel ratio để đỡ lag
  - tạm dừng khi tab bị ẩn
  - tắt nếu người dùng bật `prefers-reduced-motion`
- Light mode và dark mode có opacity/blend khác nhau để không bị chói.


## Candidate V23 - Sửa shader làm lệch bố cục

- Đã chuyển `goldShader` vào trong `.hero-bg`, tức là nó chỉ còn là lớp nền.
- Shader không còn là child trực tiếp của layout hero nên không ảnh hưởng grid/flex/bố cục nữa.
- Cố định z-index:
  - shader nằm dưới cùng
  - orb/grid nền nằm phía trên shader
  - nội dung hero và card nằm trên cùng
- Bổ sung CSS `contain` để canvas không làm layout bị tính sai.


## Candidate V24 - Sửa mất link file CV + tăng giới hạn 10MB

- Đã tăng giới hạn upload CV từ 5MB lên 10MB ở frontend và Apps Script.
- Đã sửa Apps Script ghi dữ liệu theo tên header để không còn lệch cột.
- File CV sẽ lưu lên Google Drive, cột `Tên file CV` lưu tên file, cột `Link file CV` lưu link Drive.
- Thêm hàm `suaLaiHeaderUngVienV24()` để chuẩn hóa lại header Sheet.
- Sau khi dán code mới phải Deploy phiên bản mới, nếu không vẫn chạy code cũ.


## Candidate V25 - Fix chữ trong 3 ô hero tự co giãn

- Đã cập nhật `APPS_SCRIPT_URL` mới:
  `https://script.google.com/macros/s/AKfycbzbm0aD-0IIyX2wbcs0O2wMQzpxo32nWuNMFPujWulZhmVLlHiFJDrHjEFBYSu-ZTcLZg/exec`
- Sửa 3 ô `TP.HCM / 1-1 / Thu nhập` để chữ tự co theo khung.
- Dùng `clamp()` cho font-size, padding và chiều cao card để hạn chế lỗi mỗi máy render font khác nhau.
- Riêng chữ `Thu nhập` được giảm nhẹ size vì dễ tràn nhất.
- Ở màn hình hẹp, 3 ô tự đổi layout để không bao giờ nhảy ra khỏi khung.


## Candidate V26 - Tối ưu card thông tin tuyển dụng

- Đã bỏ danh sách bullet dài trong hero card.
- Thay bằng 4 ô thông tin ngắn gọn:
  - Địa điểm / TP.HCM
  - Đào tạo / Training đầu vào
  - Phù hợp / Gen Z - Người mới
  - Yêu cầu / Smartphone + di chuyển
- Giữ đủ thông tin nhưng nhìn sạch hơn, gọn hơn và đỡ rối trên nhiều kích thước màn hình.
- Chỉnh lại 3 nút vị trí tuyển dụng cho nhỏ gọn và đều hơn.


## Candidate V27 - Nền shader động toàn trang

- Đã chuyển Gold Shader từ riêng phần Hero sang lớp nền cố định toàn trang.
- Shader không tham gia layout nên không làm lệch bố cục.
- Nền động chạy xuyên suốt khi cuộn trang PC/mobile.
- Giảm opacity ở light mode và mobile để không chói/rối nội dung.
- Nội dung, header, menu, form và popup luôn nằm trên lớp shader.


## Candidate V28 - Thêm trang Nhà nguyên căn

- Giữ nguyên `index.html` cho Chuyên viên tư vấn cho thuê căn hộ.
- Thêm `nha-nguyen-can.html` cho Chuyên viên tư vấn cho thuê nhà nguyên căn.
- Trang mới dùng logo UCR riêng.
- Nội dung Why, Quick Match, công việc, FAQ, form và nơi làm việc đã được viết lại cho nhóm Nhà nguyên căn.
- Bộ phận Nhà nguyên căn chỉ hiển thị văn phòng 125 Trần Bình Trọng, không hiển thị danh sách nhiều chi nhánh.
- Hai trang có thanh chuyển nhanh Căn hộ / Nhà nguyên căn.


## Candidate V29 - Tách riêng Sheet Unite Central Real

- `index.html` → lưu hồ sơ vào `Ứng viên Căn hộ`.
- `nha-nguyen-can.html` → lưu hồ sơ vào `Ứng viên UCR`.
- CV Căn hộ lưu trong thư mục Drive `Unite Group - CV Căn hộ`.
- CV UCR lưu trong thư mục Drive `Unite Central Real - CV ứng viên`.
- Link CV trong Sheet hiển thị thành nút chữ `Mở CV`.
- Có hàm chuyển dữ liệu từ sheet `Ứng viên` cũ sang hai sheet mới.
- Xem hướng dẫn đầy đủ tại `HUONG_DAN_TACH_SHEET_UCR_V29.md`.


## Candidate V30 - Đồng bộ theo bộ file và 4 ảnh mới Hạnh gửi

- Frontend Căn hộ đã được cập nhật theo `index(25).html`, `style(16).css`, `app(10).js`, `config(10).js`.
- Dữ liệu bản đồ được cập nhật theo bộ `branches(3)`.
- Đã đưa trực tiếp 4 ảnh mới vào:
  - `img/01.JPG` – Training
  - `img/02.JPG` – Môi trường làm việc
  - `img/03.JPG` – Vinh danh
  - `img/04.JPG` – Team building
- Web ưu tiên 4 ảnh local mới, tránh bị dữ liệu Gallery cũ trong Sheet ghi đè.
- Giữ nguyên hai trang:
  - `index.html` – Căn hộ
  - `nha-nguyen-can.html` – Unite Central Real
- Giữ Apps Script V29 tách riêng:
  - `Ứng viên Căn hộ`
  - `Ứng viên UCR`
- File Apps Script V24 Hạnh upload được lưu làm bản backup, không dùng làm backend chính để tránh quay lại một Sheet chung.


## Candidate V31 - Tối ưu UI hero, chuyển mode và vị trí tự động

- Giảm mạnh số lượng nút/thẻ trong phần Hero:
  - 4 badge chuyển thành danh sách thông tin không viền.
  - 3 vị trí tuyển dụng chuyển thành danh sách gọn.
  - 4 ô thông tin chuyển thành bảng facts không dùng card riêng.
  - 3 chỉ số chuyển thành một dải thống nhất.
  - `Xem chi nhánh` chuyển thành text link.
- Mode mặc định vẫn là `Auto`.
- Khi đổi Auto/Sáng/Tối, màu giao diện lan ra từ chính nút chuyển mode.
- Trang Căn hộ tự yêu cầu quyền vị trí sau khi load và đề xuất văn phòng gần nhất.
- Nếu ứng viên từ chối định vị, web không hiện alert gây khó chịu; nút `Gợi ý gần tôi` vẫn dùng thủ công.
- Nút upload CV được đổi thành thẻ upload cao cấp, hiển thị tên file đã chọn.
- Không thay đổi Apps Script hoặc cấu trúc hai Sheet Căn hộ/UCR.


## Candidate V32 - Fix ảnh gallery và watermark nền

- Đã bỏ lớp phủ vàng trên ảnh gallery để ảnh hiển thị đúng màu gốc.
- Giữ watermark nền blur nhưng tăng độ rõ nhẹ để nổi hơn.
- Không thay đổi Apps Script.
