# JD Koko Linh - Content Writer & Creator (Part-time)

Trang tuyển dụng mới, nằm chung repo với các JD Unite Group hiện có.

- File trang: `koko-linh.html`
- File cấu hình: `data/config-koko.js`
- Ảnh: `img/koko/` (đang để placeholder, thay bằng ảnh thật)

---

## 1. Đăng lên GitHub Pages

Các file đã nằm đúng cấu trúc nên chỉ cần push lên nhánh `main`:

```bash
git add .
git commit -m "Add Koko Linh Content Writer JD page"
git push origin main
```

Đường dẫn sau khi push: `https://unitemedia2010-oss.github.io/JD_UNITEGROUP/koko-linh.html`

> GitHub Pages phân biệt hoa/thường. Tên file trong link phải khớp tuyệt đối (`koko-linh.html`).

---

## 2. Bắt buộc: Deploy lại Apps Script

Form ứng tuyển gửi về Apps Script để lưu vào Google Sheet. Để tạo sheet mới
`Ứng viên Koko Linh` và thư mục Drive mới, cần làm 2 việc:

1. Mở Google Apps Script, dán lại toàn bộ code trong
   `google-apps-script/Code.gs` (đây là bản V34).
2. Chạy hàm `setupCareerSheetsV29()` một lần để tạo sheet mới.
3. Deploy phiên bản mới (Deploy → New version → Web app → Execute as: Me,
   Who has access: Anyone).

Nếu không deploy, form vẫn gửi được nhưng hồ sơ sẽ rơi vào sheet
`Ứng viên Căn hộ`. Phải deploy mới để tách đúng sheet.

### Nơi hồ sơ được lưu

| Trang | Sheet | Thư mục Drive CV |
| --- | --- | --- |
| `index.html` | Ứng viên Căn hộ | `Unite Group - CV Căn hộ` |
| `nha-nguyen-can.html` | Ứng viên UCR | `Unite Central Real - CV ứng viên` |
| `tpa.html` | Ứng viên UCR | `Unite Central Real - CV ứng viên` |
| `koko-linh.html` | Ứng viên Koko Linh | `Koko Linh - CV ứng viên` |

Trang Koko Linh tự nhận diện qua `source = career-jd-koko-linh` trong
`data/config-koko.js`.

---

## 3. Thay ảnh thật và logo

Hiện đang dùng placeholder. Thay theo 2 bước:

**Logo**

- Đường dẫn hiện tại: `img/koko/logo-koko.svg`
- Đặt file logo mới vào `img/koko/` (ưu tiên SVG hoặc PNG nền trong suốt).
- Cập nhật `LOGO_URL` và `MARKER_URL` trong `data/config-koko.js`.
- Cập nhật luôn trong `js/admin.js` dòng `logoUrls` để CMS preview đúng logo:

```js
'koko-linh':'img/koko/ten-logo-moi.png'
```

**Ảnh gallery (4 ảnh)**

- Mặc định: `img/koko/placeholder-01.svg` … `placeholder-04.svg`
- Thay bằng ảnh thật trong `data/config-koko.js`, mục `LOCAL_GALLERY`:

```js
LOCAL_GALLERY: [
  { title: "...", caption: "...", image: "img/koko/01.jpg" },
  ...
]
```

---

## 4. Quản trị nội dung qua CMS

Vào `admin.html` → chọn tab **Koko Linh**.

- Trang này có **101 vị trí chữ** và **16 nhóm mục** có thể sửa trực tiếp.
- Nội dung lưu vào sheet `Web_Content`, cột `Trang (Page)` = `koko-linh`.

Nếu muốn thêm key CMS mới, nhớ khai báo key đó trong sheet `Web_Content` với
đúng tên trang `koko-linh`.

### Các block riêng của trang này

| Block key | Ý nghĩa |
| --- | --- |
| `channel1` | Danh sách nội dung kênh Koko Linh (Branding) |
| `channel2` | Danh sách nội dung kênh Linh Địa Ốc (Bất động sản) |
| `req1` | Yêu cầu 01 — Kinh nghiệm thực chiến |
| `req2` | Yêu cầu 02 — Tư duy nội dung |
| `req3` | Yêu cầu 03 — Kỹ năng bổ trợ & thái độ |

Các block này đã được khai báo trong `js/blocks.js` nên CMS tự hiện nút
"Thêm / xóa mục" cho chúng.

---

## 5. Cấu trúc trang

| Section | ID | Nội dung |
| --- | --- | --- |
| Hero | - | Tiêu đề vị trí, điểm nổi bật, thông tin nhanh |
| Why | - | 4 lý do nên gia nhập |
| Hai kênh | `#channels` | Kênh 1 Branding + Kênh 2 Sale, kèm KPI của từng kênh |
| Quick Match | `#fit` | 5 câu tự đánh giá mức độ phù hợp |
| Công việc | `#job` | 5 bước công việc chính |
| Thu nhập | `#salary` | Lương cứng + 2 mảng thưởng KPI |
| Yêu cầu | `#requirements` | 3 nhóm yêu cầu ứng viên |
| Lộ trình | `#growth` | 5 bậc phát triển sự nghiệp |
| Văn hóa | `#culture` | 4 ảnh Behind The Scenes |
| FAQ | `#faq` | 6 câu hỏi thường gặp |
| Ứng tuyển | `#apply` | Form + thông tin liên hệ |

---

## 6. Thay đổi thông tin liên hệ

Trang có **2 nút bấm được** trong phần Ứng tuyển, cộng thêm link ở footer:

| Nút | Link | Mở gì |
| --- | --- | --- |
| Gửi hồ sơ qua Email | `mailto:...` | Mở app mail, **tiền tố sẵn** |
| Nhắn Zalo trực tiếp | `https://zalo.me/...` | Mở Zalo nhắn với số đó |

Sửa ở 3 chỗ trong `koko-linh.html`:

1. Nút Email — đổi địa chỉ trong `href="mailto:..."`
2. Nút Zalo — đổi số trong `href="https://zalo.me/..."`
3. Footer — đổi cả 2 link

```html
<!-- Email: doi dia chi va noi dung mau trong href -->
<a class="contact-btn"
   href="mailto:nguyenphitruong1807@gmail.com?subject=...&body=...">

<!-- Zalo: doi so dien thoai, bo dau + trong href -->
<a class="contact-btn contact-zalo"
   href="https://zalo.me/0782800780">
```

Nội dung hiển thị trên nút nằm trong `data-cms` nên sửa được qua CMS:
`contact_email`, `contact_email_label`, `contact_zalo`,
`contact_zalo_label`, `contact_deadline`.

Thông tin hiện tại:

- Email: `nguyenphitruong1807@gmail.com`
- Zalo: `0782800780` (Trường)
- Hạn nhận hồ sơ: `20/10/2026`

---

## 7. Lưu ý khi sửa form

Trong `data/config-koko.js` giữ nguyên `DEFAULT_SOURCE`. Apps Script dùng
giá trị này để định tuyến hồ sơ về đúng sheet:

```js
DEFAULT_SOURCE: "career-jd-koko-linh",
DEFAULT_POSITION: "Content Writer & Creator (Part-time)",
```

`DEFAULT_POSITION` cũng được dùng để nhận diện vị trí, nên đừng đổi tùy ý
nếu không cần.

---

## 8. Kiểm tra trước khi đăng

- Mở `koko-linh.html`, cuộn hết trang: mọi section phải hiện nội dung.
- Mở Console (F12): không có lỗi đỏ.
- Bấm thử Quick Match: kết quả phải đổi theo số mục đã chọn.
- Điền form và gửi: kiểm tra sheet `Ứng viên Koko Linh` có dòng mới,
  cột `Link file CV` hiện chữ **Mở CV** bấm được.