/**
 * UNITE GROUP CAREER JD - APPS SCRIPT BACKEND
 * Phiên bản cho ứng viên: lưu thông tin + file CV lên Google Drive, lưu link CV vào sheet "Ứng viên".
 */

const SHEET_ID = "13syUfCyNPcvKcQI8xi5or_Uq-CbYoCbzfuiuPOwYs1o";
const CV_FOLDER_NAME = "Unite Group - CV ứng viên";

const TEN_SHEET = {
  ungVien: "Ứng viên",
  chiNhanh: "Chi nhánh",
  hinhAnh: "Hình ảnh văn hóa",
  cauHinh: "Cấu hình JD"
};

function setupSheets() {
  return taoBangMau();
}

function taoBangMau() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  taoHoacLaySheet_(ss, TEN_SHEET.ungVien, [
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
  ]);

  const sheetChiNhanh = taoHoacLaySheet_(ss, TEN_SHEET.chiNhanh, [
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
  ]);

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
    message: "Đã tạo bảng mẫu tiếng Việt cho Unite Group Career JD.",
    sheets: Object.values(TEN_SHEET)
  });
}

function doGet(e) {
  const action = String(e.parameter.action || "").toLowerCase();

  if (action === "health") {
    return traJson_({
      ok: true,
      message: "Unite Group Career JD Apps Script đang hoạt động.",
      version: "CANDIDATE_CV_UPLOAD_V1"
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
  const sheet = taoHoacLaySheet_(ss, TEN_SHEET.ungVien, [
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
  ]);

  let cvName = "";
  let cvUrl = "";

  if (data.cvFile && data.cvFile.data) {
    const saved = luuFileCvLenDrive_(data.cvFile, data.name || "Ung vien");
    cvName = saved.name;
    cvUrl = saved.url;
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    sheet.appendRow([
      new Date(),
      data.position || "",
      data.name || "",
      data.phone || "",
      data.birthyear || "",
      data.area || "",
      data.type || "",
      data.profile || "",
      cvName,
      cvUrl,
      data.source || "",
      data.userAgent || ""
    ]);
  } finally {
    lock.releaseLock();
  }

  return { cvName, cvUrl };
}

function luuFileCvLenDrive_(fileData, candidateName) {
  const folder = layHoacTaoThuMucCv_();
  const safeName = taoTenFileAnToan_(candidateName);
  const originalName = fileData.name || "cv";
  const extension = originalName.includes(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
  const finalName = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") + "_" + safeName + extension;

  const bytes = Utilities.base64Decode(fileData.data);
  const blob = Utilities.newBlob(bytes, fileData.type || "application/octet-stream", finalName);
  const file = folder.createFile(blob);

  // Cho phép ai có link đều xem file. Nếu muốn nội bộ thôi, có thể xóa dòng dưới.
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

function anSheetApplicationsCu() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const oldSheet = ss.getSheetByName("Applications");
  if (oldSheet) oldSheet.hideSheet();

  return traJson_({
    ok: true,
    message: "Đã ẩn sheet Applications cũ nếu tồn tại."
  });
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

function taoHoacLaySheet_(ss, tenSheet, headers) {
  let sheet = ss.getSheetByName(tenSheet);
  if (!sheet) sheet = ss.insertSheet(tenSheet);

  const lastCol = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
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

function themDuLieuChiNhanhMau_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const rows = [
    ["Văn phòng chính", "125 Trần Bình Trọng, phường Chợ Quán, TP.HCM", 10.75609363585227, 106.6810910436253, "Trụ sở chính Unite Group", "", "", "", "Có", "Có"],
    ["VP chi nhánh KSC & MVC", "39 Mai Văn Vĩnh, Phường Tân Hưng, TP.HCM", 10.7403398, 106.7137972, "", "", "", "", "", "Có"],
    ["VP chi nhánh TBC & TSC", "1/17 Hoàng Việt, Phường Tân Bình Nam, Quận Tân Bình, TP.HCM", 10.7976672, 106.6601844, "", "", "", "", "", "Có"],
    ["VP chi nhánh DEC", "63 Dương Bá Trạc, Phường Dương Bá Trạc, Quận 8, TP.HCM", 10.7490577, 106.6885216, "", "", "", "", "", "Có"],
    ["VP chi nhánh DOC 1", "99A Dương Bá Trạc, Phường Dương Bá Trạc, Quận 8, TP.HCM", 10.748394, 106.688941, "", "", "", "", "", "Có"],
    ["VP chi nhánh DTC 1 & DTC 2", "120A Trần Kế Xương, Phường Phú Nhuận Trung, Quận Phú Nhuận, TP.HCM", 10.7887409, 106.6753295, "", "", "", "", "", "Có"],
    ["VP TPKD Shark", "413/8 Lê Văn Sỹ, Phường Lê Văn Sỹ, Quận 3, TP.HCM", 10.8023195, 106.6896774, "", "", "", "", "", "Có"],
    ["VP chi nhánh BTC 1", "202/8 Nguyễn Xí, Phường Bình Thạnh Bắc, Quận Bình Thạnh, TP.HCM", 10.8168499, 106.7065796, "", "", "", "", "", "Có"]
  ];

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.autoResizeColumns(1, rows[0].length);
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

function traJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
