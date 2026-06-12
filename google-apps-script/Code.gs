/**
 * UNITE GROUP CAREER JD - APPS SCRIPT BACKEND
 * V24: sửa đúng cột CV, lưu file lên Drive, lưu link file CV vào sheet "Ứng viên".
 * Lưu ý: sau khi dán code này phải Deploy phiên bản mới.
 */

const SHEET_ID = "13syUfCyNPcvKcQI8xi5or_Uq-CbYoCbzfuiuPOwYs1o";
const CV_FOLDER_NAME = "Unite Group - CV ứng viên";
const MAX_CV_MB = 10;

const TEN_SHEET = {
  ungVien: "Ứng viên",
  chiNhanh: "Chi nhánh",
  hinhAnh: "Hình ảnh văn hóa",
  cauHinh: "Cấu hình JD"
};

const UNG_VIEN_HEADERS = [
  "Thời gian gửi",
  "Vị trí ứng tuyển",
  "Họ và tên",
  "Số điện thoại/Zalo",
  "Năm sinh",
  "Khu vực mong muốn",
  "Hình thức làm việc",
  "Link Facebook/Portfolio",
  "Tên file CV",
  "Link file CV",
  "Nguồn ứng tuyển",
  "Thiết bị/Trình duyệt"
];

const CHI_NHANH_HEADERS = [
  "Tên văn phòng/chi nhánh",
  "Địa chỉ",
  "Vĩ độ",
  "Kinh độ",
  "Ghi chú",
  "Link hình ảnh",
  "Link Google Maps",
  "Link chỉ đường",
  "Trụ sở chính",
  "Hiển thị"
];

function setupSheets() {
  return taoBangMau();
}

function taoBangMau() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  taoHoacLaySheet_(ss, TEN_SHEET.ungVien, UNG_VIEN_HEADERS);
  const sheetChiNhanh = taoHoacLaySheet_(ss, TEN_SHEET.chiNhanh, CHI_NHANH_HEADERS);

  taoHoacLaySheet_(ss, TEN_SHEET.hinhAnh, [
    "Tiêu đề",
    "Mô tả ngắn",
    "Link hình ảnh",
    "Hiển thị"
  ]);

  taoHoacLaySheet_(ss, TEN_SHEET.cauHinh, [
    "Mục cấu hình",
    "Giá trị"
  ]);

  themDuLieuChiNhanhMau_(sheetChiNhanh);

  return traJson_({
    ok: true,
    message: "Đã tạo/cập nhật bảng Unite Group Career JD.",
    version: "V24_CV_LINK_FIXED_10MB"
  });
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "").toLowerCase();

  if (action === "health") {
    return traJson_({
      ok: true,
      message: "Unite Group Career JD Apps Script đang hoạt động.",
      version: "V24_CV_LINK_FIXED_10MB",
      maxCvMb: MAX_CV_MB
    });
  }

  if (action === "getdata") {
    return traJson_({
      ok: true,
      branches: layChiNhanh_(),
      gallery: layHinhAnhVanHoa_(),
      config: layCauHinh_()
    });
  }

  return traJson_({
    ok: true,
    message: "Unite Group Career JD API",
    actions: ["health", "getData"]
  });
}

function doPost(e) {
  try {
    const payload = docDuLieuGuiLen_(e);
    const action = String(payload.action || "").toLowerCase();

    if (action !== "apply") {
      return traJson_({ ok: false, message: "Action không hợp lệ." });
    }

    const result = luuUngVien_(payload.data || payload);

    return traJson_({
      ok: true,
      message: "Đã lưu thông tin ứng viên vào sheet Ứng viên.",
      cvName: result.cvName || "",
      cvUrl: result.cvUrl || ""
    });

  } catch (err) {
    return traJson_({
      ok: false,
      message: err.message || String(err)
    });
  }
}

function luuUngVien_(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = taoHoacLaySheet_(ss, TEN_SHEET.ungVien, UNG_VIEN_HEADERS);

  let cvName = "";
  let cvUrl = "";

  if (data.cvFile && data.cvFile.data) {
    const saved = luuFileCvLenDrive_(data.cvFile, data.name || "Ung vien");
    cvName = saved.name;
    cvUrl = saved.url;
  }

  const rowObject = {
    "Thời gian gửi": new Date(),
    "Vị trí ứng tuyển": data.position || "",
    "Họ và tên": data.name || "",
    "Số điện thoại/Zalo": data.phone || "",
    "Năm sinh": data.birthyear || "",
    "Khu vực mong muốn": data.area || "",
    "Hình thức làm việc": data.type || "",
    "Link Facebook/Portfolio": data.profile || "",
    "Tên file CV": cvName,
    "Link file CV": cvUrl,
    "Nguồn ứng tuyển": data.source || "",
    "Thiết bị/Trình duyệt": data.userAgent || ""
  };

  const headers = layHeaders_(sheet);
  const row = headers.map(header => rowObject[header] !== undefined ? rowObject[header] : "");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  return { cvName, cvUrl };
}

function luuFileCvLenDrive_(fileData, candidateName) {
  const sizeBytes = Number(fileData.size || 0);
  if (sizeBytes > MAX_CV_MB * 1024 * 1024) {
    throw new Error("File CV vượt quá " + MAX_CV_MB + "MB. Vui lòng chọn file nhẹ hơn.");
  }

  const folder = layHoacTaoThuMucCv_();
  const safeName = taoTenFileAnToan_(candidateName);
  const originalName = String(fileData.name || "cv");
  const extension = originalName.includes(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
  const finalName = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") + "_" + safeName + extension;

  const bytes = Utilities.base64Decode(fileData.data);
  const blob = Utilities.newBlob(bytes, fileData.type || "application/octet-stream", finalName);
  const file = folder.createFile(blob);

  // Cho phép HR mở bằng link trong Sheet.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    name: finalName,
    url: file.getUrl()
  };
}

function layHoacTaoThuMucCv_() {
  const folders = DriveApp.getFoldersByName(CV_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CV_FOLDER_NAME);
}

function suaLaiHeaderUngVienV24() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = taoHoacLaySheet_(ss, TEN_SHEET.ungVien, UNG_VIEN_HEADERS);
  sheet.getRange(1, 1, 1, UNG_VIEN_HEADERS.length).setValues([UNG_VIEN_HEADERS]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, UNG_VIEN_HEADERS.length);

  return traJson_({
    ok: true,
    message: "Đã chuẩn hóa lại header sheet Ứng viên theo V24."
  });
}

function anSheetApplicationsCu() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const oldSheet = ss.getSheetByName("Applications");
  if (oldSheet) oldSheet.hideSheet();

  return traJson_({
    ok: true,
    message: "Đã ẩn sheet Applications cũ nếu tồn tại."
  });
}

function taoHoacLaySheet_(ss, tenSheet, headers) {
  let sheet = ss.getSheetByName(tenSheet);
  if (!sheet) sheet = ss.insertSheet(tenSheet);

  const currentLastCol = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0].map(String);
  const isEmpty = currentHeaders.every(cell => cell === "");

  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    headers.forEach(header => {
      if (!currentHeaders.includes(header)) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      }
    });
  }

  sheet.autoResizeColumns(1, Math.max(sheet.getLastColumn(), headers.length));
  return sheet;
}

function layHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

function themDuLieuChiNhanhMau_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const rows = [
    ["Văn phòng chính DFC", "125 Trần Bình Trọng, phường Chợ Quán, TP.HCM (Quận 5 cũ)", 10.75609363585227, 106.6810910436253, "", "", "", "", "Có", "Có"],
    ["VP chi nhánh KSC & MVC", "39 Mai Văn Vĩnh, Phường Tân Hưng, TP.HCM (Quận 7 cũ)", 10.7403398, 106.7137972, "", "", "", "", "", "Có"],
    ["VP chi nhánh EVO", "479 Trần Xuân Soạn, Phường Tân Hưng, TP.HCM (Quận 7 cũ)", 10.7417, 106.7199, "", "", "", "", "", "Có"],
    ["VP chi nhánh DOC 1", "99A Dương Bá Trạc, Phường Chánh Hưng, Quận 8, TP.HCM (Quận 8 cũ)", 10.748394, 106.688941, "", "", "", "", "", "Có"],
    ["VP chi nhánh CTC", "457/73 Cách Mạng Tháng Tám, Phường Hòa Hưng, TP.HCM (Quận 10 cũ)", 10.7768, 106.6707, "", "", "", "", "", "Có"],
    ["VP chi nhánh TBC & TSC", "1/17 Hoàng Việt, Phường Tân Bình Nam, Quận Tân Bình, TP.HCM (Quận Tân Bình cũ)", 10.7976672, 106.6601844, "", "", "", "", "", "Có"],
    ["VP chi nhánh PNC", "120A Trần Kế Xương, Phường Phú Nhuận Trung, Quận Phú Nhuận, TP.HCM (Quận Phú Nhuận cũ)", 10.7887409, 106.6753295, "", "", "", "", "", "Có"],
    ["VP chi nhánh BTC 1", "202/8 Nguyễn Xí, Phường Bình Thạnh Bắc, Quận Bình Thạnh, TP.HCM (Quận Bình Thạnh cũ)", 10.8168499, 106.7065796, "", "", "", "", "", "Có"]
  ];

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.autoResizeColumns(1, rows[0].length);
}

function layChiNhanh_() {
  const rows = docSheetThanhObject_(TEN_SHEET.chiNhanh);

  return rows
    .filter(row => dangHienThi_(row["Hiển thị"]))
    .map((row, index) => {
      const ten = row["Tên văn phòng/chi nhánh"] || "";
      const diaChi = row["Địa chỉ"] || "";
      const lat = Number(row["Vĩ độ"] || 0);
      const lng = Number(row["Kinh độ"] || 0);
      const maps = row["Link Google Maps"] || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(diaChi || (lat + "," + lng)));
      const directions = row["Link chỉ đường"] || ("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(diaChi || (lat + "," + lng)) + "&travelmode=driving");

      return {
        id: taoSlug_(ten || ("chi-nhanh-" + index)),
        name: ten,
        address: diaChi,
        lat: lat,
        lng: lng,
        note: row["Ghi chú"] || "",
        image: row["Link hình ảnh"] || "",
        googleMaps: maps,
        directions: directions,
        isHQ: String(row["Trụ sở chính"] || "").toLowerCase() === "true" || String(row["Trụ sở chính"] || "").toLowerCase() === "có"
      };
    })
    .filter(row => row.name && row.lat && row.lng);
}

function layHinhAnhVanHoa_() {
  const rows = docSheetThanhObject_(TEN_SHEET.hinhAnh);

  return rows
    .filter(row => dangHienThi_(row["Hiển thị"]))
    .map(row => ({
      title: row["Tiêu đề"] || "",
      caption: row["Mô tả ngắn"] || "",
      image: row["Link hình ảnh"] || ""
    }))
    .filter(row => row.title || row.image);
}

function layCauHinh_() {
  const rows = docSheetThanhObject_(TEN_SHEET.cauHinh);
  const obj = {};

  rows.forEach(row => {
    if (row["Mục cấu hình"]) obj[row["Mục cấu hình"]] = row["Giá trị"] || "";
  });

  return obj;
}

function docSheetThanhObject_(tenSheet) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(tenSheet);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function docDuLieuGuiLen_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};

  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    if (e.parameter && e.parameter.payload) return JSON.parse(e.parameter.payload);
    throw new Error("Không đọc được dữ liệu gửi lên.");
  }
}

function dangHienThi_(value) {
  const text = String(value || "").trim().toLowerCase();
  return text === "" || text === "có" || text === "co" || text === "true" || text === "1" || text === "yes" || text === "active";
}

function taoSlug_(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function taoTenFileAnToan_(text) {
  return String(text || "ung-vien")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60) || "ung-vien";
}

function traJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
