# Hệ Thống Quản Lý Nội Dung Hàng Tuần — Koko Linh

Tự động hoá dòng chảy công việc của 4 khâu: **Kịch bản → Hẹn lịch → Media → Creator Main**.

---

## 1. Cách tạo (2 phút)

1. Mở Google Sheets → tạo **Sheet trống**, đặt tên (vd: `Kế hoạch nội dung Koko Linh`)
2. Menu **Extensions → Apps Script**
3. Xoá hết nội dung mặc định, **dán toàn bộ** file `google-apps-script/NoiDungKokoLinh.gs`
4. **Save** (Ctrl+S)
5. Chọn hàm **`taoHeThong`** trong dropdown → bấm **Run**
6. Lần đầu sẽ báo "Google hasn't verified" → bấm **Advanced → Go to (project name) → Allow**

Xong. Hệ thống tự tạo 6 tab.

> **Không cần Deploy.** Đây là script gắn với đúng file Sheet này, chạy trong chính file đó.

---

## 2. 6 tab được tạo

| Tab | Dùng để làm gì |
|---|---|
| **Dashboard** | Xem tổng quan tuần: tiến độ 4 khâu, chi phí, kết quả, cảnh báo trễ |
| **Lịch đăng** | 33 cột — nơi chính của bài đăng, có hạn chót tự tính |
| **Lịch quay** | 18 cột — buổi quay, chi phí, người hẹn |
| **Kho clip** | Clip đã quay xong chưa dùng (7 clip cũ đã được chuyển sang) |
| **Cấu hình** | Tham số tuần + danh sách nhân sự |
| **Lịch sử cũ** | 18 buổi quay + 5 bài đăng cũ (29/09 – 11/10), đã làm sạch |

---

## 3. Bước đầu tiên: ghi tên nhân sự

Vào tab **Cấu hình**, cột E, ghi tên — **mỗi người 1 dòng**:

```
Linh Trương
Nguyễn Phi Trường
Tên người quay media 1
Tên người quay media 2
```

Xong bấm **⚙️ HỆ THỐNG NỘI DUNG → ♻️ Tạo lại toàn bộ hệ thống** để dropdown trong Lịch đăng / Lịch quay lấy danh sách này.

**Cột Người viết KB / Người quay / Người duyệt / Người đăng để trống cũng được.** Hệ thống không gò ai — ai nhận việc thì điền tên vào.

---

## 4. Cách dùng hàng tuần

### Bước 1 — Sinh tuần mới

Menu **⚙️ HỆ THỐNG NỐI DUNG → ➕ Sinh tuần mới**

Nhập ngày thứ Hai của tuần (vd `19/10/2026`), hoặc để trống để tự lấy tuần kế tiếp.

Hệ thống tự tạo:
- **Lịch đăng:** 2 clip Trải nghiệm + 3 clip Nhà
- **Lịch quay:** 3 buổi trải nghiệm + 4 buổi nhà

Kênh, loại, giờ đăng, ngày đăng đã điền sẵn. Tuần không bị sinh trùng.

### Bước 2 — Điền thông tin

| Việc | Ở đâu |
|---|---|
| Tên clip, địa dạng | Lịch đăng, cột H, I |
| Caption / Hook | Lịch đăng, cột V |
| Địa điểm, chi phí buổi quay | Lịch quay, cột I, K |
| Tên người hẹn, người quay | Lịch quay, cột L, M |

### Bước 3 — Cập nhật tiến độ

Mỗi ngày vào Lịch đăng đổi trạng thái 4 khâu (đều là dropdown):

```
Kịch bản:  Chưa viết → Đang viết → Đã viết → Đã duyệt
Quay:      Chưa quay → Đã hẹn → Đang quay → Đã quay
Dựng:     Chưa dựng → Đang dựng → Đã dựng
Duyệt/Đăng: Chưa duyệt → Đang duyệt → Đã duyệt → Đã đăng
```

### Bước 4 — Nhập số liệu sau khi đăng

Lịch đăng, cột X → AB: **Lượt xem, Like, Bình luận, Chia sẻ, Lưu, Khách nhắn**
cột AD: **Xử lý lead** (Chưa gọi / Đã gọi / Hẹn xem nhà / Chốt / Không phù hợp)

Dashboard tự tính: tổng view, tổng tương tác, tổng lead, tỷ lệ view → lead, top 3 clip.

---

## 5. Hạn chót tự động

Chỉ cần điền **Ngày đăng**. Ba hạn chót còn lại tự tính ngược:

| Hạn | Công thức | Mặc định |
|---|---|---|
| Hạn Kịch bản | Ngày đăng − 5 | Sửa ở Cấu hình B8 |
| Hạn quay | Ngày đăng − 3 | Cấu hình B9 |
| Hạn dựng | Ngày đăng − 1 | Cấu hình B10 |

Khi đổi ngày đăng, cả 3 hạn dịch theo. Không phải tính tay.

**Cảnh báo tự hiện** ở cột AF, tô màu:

| Màu | Nghĩa là |
|---|---|
| Đỏ | Trễ kịch bản / Trễ quay / Trễ dựng |
| Vàng | Quá ngày đăng nhưng chưa đăng |
| Xanh | OK |

Cột AG cho biết **vai trò nào cần xử lý** tiếp theo — không chỉ điểm danh tên ai.

---

## 6. Cách "dẫn dắt cả team" mà không gò bó ai

Đây là ý bạn yêu cầu, cách làm:

1. **Không chỉ định người trước.** Ô Người phụ trách luôn có thể để trống. Ai rảnh thì nhận, nhận xong điền tên.

2. **Deadline do hệ thống đặt, không phải do người.** Chỉ có 1 ngày đăng là dữ liệu gốc, chuỗi hạn tự sinh ra. Không ai có thể "quên deadline" vì deadline không nằm trong đầu ai cả.

3. **Dashboard đếm số việc trễ.** Mỗi tuần nhìn 1 lần: có bao nhiêu việc trễ, trễ ở khâu nào, cần vai trò nào xử lý. Nếu khâu Kịch bản hay trễ thì biết ngay phải bổ sung người viết — không cần ai bị điểm tên.

4. **Tiến độ 4 khâu hiện %.** Thấy Media dựng là nút thắt thì điều ngay, không đợi cuối tuần mới biết.

---

## 7. Bảng Cấu hình — đổi gì được

| Ô | Tham số |
|---|---|
| B2 | Tên kênh trải nghiệm |
| B3 | Tên kênh bất động sản |
| B4 | Số clip trải nghiệm / tuần (mặc định 2) |
| B5 | Số clip nhà / tuần (mặc định 3) |
| B6 | Số buổi quay trải nghiệm / tuần (mặc định 3) |
| B7 | Số buổi quay nhà / tuần (mặc định 4) |
| B8 | Số ngày cho Kịch bản (mặc định 5) |
| B9 | Số ngày cho Quay (mặc định 3) |
| B10 | Số ngày cho Dựng (mặc định 1) |
| B11 | Giờ đăng trải nghiệm (mặc định 10:00) |
| B12 | Giờ đăng nhà (mặc định 20:00) |
| B13 | Ngân sách quay / tuần (mặc định 3.000.000) |
| B14 | Ngày bắt đầu tuần |

Đổi xong bấm **🔄 Tính lại Dashboard**.

---

## 8. Một dòng clip = một bài đăng

Đúng như bạn chốt: **không tách 1 buổi quay thành nhiều dòng lịch.**

- Mỗi trải nghiệm = 1 clip = 1 bài đăng (trống drum = 1 bài, làm thảm = 1 bài)
- Cùng 1 dự án nhà nhưng căn 1PN / 2PN / 3PN = **3 bài đăng riêng**, mỗi căn 1 dòng

Nên sheet không có cột "buổi quay gốc" — mỗi dòng là 1 clip độc lập.

---

## 9. Dữ liệu cũ đã migrate

Tab **Lịch sử cũ**:
- 18 buổi quay (30/09 – 11/10) — đã gộp 3 khối bảng bị trùng tiêu đề trong file .xlsx
- 5 bài đăng cũ
- 7 clip tồn kho đã chuyển sang tab **Kho clip**:
  - Trải nghiệm: Trống drum, Workshop bắn thảm, Leo núi, Workshop làm bạc
  - Nhà: The Privé 1PN, Kingdom review, Q7 Riversite review

---

## 10. Xử lý sự cố

| Hiện tượng | Cách sửa |
|---|---|
| Không thấy menu ⚙️ | Refresh trang (F5) |
| Dropdown trống trong Lịch đăng | Ghi tên ở Cấu hình E → ♻️ Tạo lại hệ thống |
| Bấm Sinh tuần mới báo trùng | Tuần đó đã có, dùng menu 📋 Đọc danh sách tuần để xem |
| Hạn chót hiện sai | Kiểm tra Cấu hình B8/B9/B10 có phải số không |
| Dashboard trống | Chọn tuần ở ô B3, rồi 🔄 Tính lại Dashboard |
| Lỡ xoá nhầm tab | ♻️ Tạo lại toàn bộ hệ thống (dữ liệu đã nhập sẽ mất, nên copy trước) |

⚠️ **Lưu ý:** "Tạo lại toàn bộ hệ thống" sẽ xoá sạch Lịch đăng / Lịch quay / Kho clip. Chỉ dùng khi cần sửa cấu trúc. Lịch sử cũ được tạo lại từ dữ liệu cứng nên không mất.