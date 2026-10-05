/**
 * UNITE GROUP / UNITE CENTRAL REAL CAREER JD
 * V30 - TÍCH HỢP HỆ THỐNG CMS VÀ LỊCH TRAINING
 *
 * Phân luồng tự động:
 * - Trang Căn hộ          -> sheet "Ứng viên Căn hộ"
 * - Trang Nhà nguyên căn -> sheet "Ứng viên UCR"
 */

const SHEET_ID = "13syUfCyNPcvKcQI8xi5or_Uq-CbYoCbzfuiuPOwYs1o";
const MAX_CV_MB = 10;

const TEN_SHEET = {
  ungVienCanHo: "Ứng viên Căn hộ",
  ungVienUcr: "Ứng viên UCR",
  ungVienCu: "Ứng viên",
  chiNhanh: "Chi nhánh",
  hinhAnh: "Hình ảnh văn hóa",
  cauHinh: "Cấu hình JD"
};

const TEN_THU_MUC_CV = {
  canHo: "Unite Group - CV Căn hộ",
  ucr: "Unite Central Real - CV ứng viên"
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

/**
 * Hàm Hạnh cần chạy đầu tiên.
 */
function setupCareerSheetsV29() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  taoHoacLaySheet_(ss, TEN_SHEET.ungVienCanHo, UNG_VIEN_HEADERS);
  taoHoacLaySheet_(ss, TEN_SHEET.ungVienUcr, UNG_VIEN_HEADERS);

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
  dinhDangSheetUngVien_(ss.getSheetByName(TEN_SHEET.ungVienCanHo));
  dinhDangSheetUngVien_(ss.getSheetByName(TEN_SHEET.ungVienUcr));

  return traJson_({
    ok: true,
    version: "V30_INTEGRATED_CMS",
    message: "Đã tạo 2 sheet riêng: Ứng viên Căn hộ và Ứng viên UCR.",
    sheets: [TEN_SHEET.ungVienCanHo, TEN_SHEET.ungVienUcr],
    maxCvMb: MAX_CV_MB
  });
}

/**
 * Giữ tương thích với tên hàm cũ.
 */
function setupSheets() {
  return setupCareerSheetsV29();
}

function taoBangMau() {
  return setupCareerSheetsV29();
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "").toLowerCase();

  if (action === "health") {
    return traJson_({
      ok: true,
      message: "Career JD Apps Script đang hoạt động.",
      version: "V31_CMS_ADMIN",
      cmsReady: (PropertiesService.getScriptProperties().getProperty("CMS_ADMIN_PASSWORD") || "").length >= 12,
      sheets: {
        canHo: TEN_SHEET.ungVienCanHo,
        ucr: TEN_SHEET.ungVienUcr
      },
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
    message: "Unite Group / Unite Central Real Career JD API",
    actions: ["health", "getData"]
  });
}

function doPost(e) {
  try {
    const payload = docDuLieuGuiLen_(e);
    const action = String(payload.action || "").toLowerCase();

    if (action === "cmssave") {
      return traJson_(luuNoiDungCms_(payload));
    }

    if (action !== "apply") {
      return traJson_({ ok: false, message: "Action không hợp lệ." });
    }

    const result = luuUngVien_(payload.data || payload);

    return traJson_({
      ok: true,
      message: "Đã lưu hồ sơ vào " + result.sheetName + ".",
      sheetName: result.sheetName,
      brand: result.brand,
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

/**
 * Tự nhận diện ứng viên thuộc Căn hộ hay UCR.
 */
function xacDinhKenhTuyenDung_(data) {
  const source = String(data.source || "").trim().toLowerCase();
  const position = String(data.position || "").trim().toLowerCase();

  const isUcr =
    source === "career-jd-nha-nguyen-can" ||
    source === "career-jd-ucr" ||
    source === "career-jd-tpa" ||
    source.includes("ucr") ||
    source.includes("tpa") ||
    source.includes("nha-nguyen-can") ||
    position.includes("nhà nguyên căn") ||
    position.includes("nha nguyen can") ||
    position.includes("unite central real") ||
    position.includes("tpa");

  if (isUcr) {
    return {
      brand: "Unite Central Real",
      sheetName: TEN_SHEET.ungVienUcr,
      cvFolderName: TEN_THU_MUC_CV.ucr
    };
  }

  return {
    brand: "Unite Group - Căn hộ",
    sheetName: TEN_SHEET.ungVienCanHo,
    cvFolderName: TEN_THU_MUC_CV.canHo
  };
}

function luuUngVien_(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const channel = xacDinhKenhTuyenDung_(data);
  const sheet = taoHoacLaySheet_(ss, channel.sheetName, UNG_VIEN_HEADERS);

  let cvName = "";
  let cvUrl = "";

  if (data.cvFile && data.cvFile.data) {
    const saved = luuFileCvLenDrive_(
      data.cvFile,
      data.name || "Ung vien",
      channel.cvFolderName
    );
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
  const row = headers.map(header =>
    rowObject[header] !== undefined ? rowObject[header] : ""
  );

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    sheet.appendRow(row);

    const lastRow = sheet.getLastRow();
    if (cvUrl) {
      const cvUrlCol = headers.indexOf("Link file CV") + 1;
      if (cvUrlCol > 0) {
        const richText = SpreadsheetApp.newRichTextValue()
          .setText("Mở CV")
          .setLinkUrl(cvUrl)
          .build();
        sheet.getRange(lastRow, cvUrlCol).setRichTextValue(richText);
      }
    }
  } finally {
    lock.releaseLock();
  }

  dinhDangSheetUngVien_(sheet);

  return {
    sheetName: channel.sheetName,
    brand: channel.brand,
    cvName,
    cvUrl
  };
}

function luuFileCvLenDrive_(fileData, candidateName, folderName) {
  const sizeBytes = Number(fileData.size || 0);

  if (sizeBytes > MAX_CV_MB * 1024 * 1024) {
    throw new Error(
      "File CV vượt quá " + MAX_CV_MB + "MB. Vui lòng chọn file nhẹ hơn."
    );
  }

  const folder = layHoacTaoThuMuc_(folderName);
  const safeName = taoTenFileAnToan_(candidateName);
  const originalName = String(fileData.name || "cv");
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf("."))
    : "";

  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd-HHmmss"
  );

  const finalName = timestamp + "_" + safeName + extension;
  const bytes = Utilities.base64Decode(fileData.data);
  const blob = Utilities.newBlob(
    bytes,
    fileData.type || "application/octet-stream",
    finalName
  );

  const file = folder.createFile(blob);
  file.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  return {
    name: finalName,
    url: file.getUrl()
  };
}

function layHoacTaoThuMuc_(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function chuyenDuLieuUngVienCuV29() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const oldSheet = ss.getSheetByName(TEN_SHEET.ungVienCu);

  if (!oldSheet) {
    return traJson_({ ok: true, message: 'Không tìm thấy sheet "Ứng viên" cũ.' });
  }

  const values = oldSheet.getDataRange().getValues();
  if (values.length < 2) {
    return traJson_({ ok: true, message: 'Sheet "Ứng viên" cũ chưa có dữ liệu.' });
  }

  const headers = values[0].map(String);
  let canHoCount = 0, ucrCount = 0;

  values.slice(1).forEach(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);

    const channel = xacDinhKenhTuyenDung_({
      source: obj["Nguồn ứng tuyển"] || "",
      position: obj["Vị trí ứng tuyển"] || ""
    });

    const targetSheet = taoHoacLaySheet_(ss, channel.sheetName, UNG_VIEN_HEADERS);
    const targetHeaders = layHeaders_(targetSheet);
    const targetRow = targetHeaders.map(header => obj[header] !== undefined ? obj[header] : "");

    targetSheet.appendRow(targetRow);
    channel.sheetName === TEN_SHEET.ungVienUcr ? ucrCount++ : canHoCount++;
  });

  dinhDangSheetUngVien_(ss.getSheetByName(TEN_SHEET.ungVienCanHo));
  dinhDangSheetUngVien_(ss.getSheetByName(TEN_SHEET.ungVienUcr));

  return traJson_({ ok: true, message: "Đã chuyển dữ liệu.", canHo: canHoCount, ucr: ucrCount });
}

function suaLoiHyperlinkCu() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetsToFix = [TEN_SHEET.ungVienCanHo, TEN_SHEET.ungVienUcr];

  sheetsToFix.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const headers = layHeaders_(sheet);
    const cvLinkCol = headers.indexOf("Link file CV") + 1;

    if (cvLinkCol > 0) {
      const range = sheet.getRange(2, cvLinkCol, lastRow - 1, 1);
      const formulas = range.getFormulas();

      formulas.forEach((row, index) => {
        const formula = row[0];
        if (formula && formula.toUpperCase().includes("HYPERLINK")) {
          const match = formula.match(/HYPERLINK\("([^"]+)"/i);
          if (match && match[1]) {
            const url = match[1];
            const richText = SpreadsheetApp.newRichTextValue()
              .setText("Mở CV")
              .setLinkUrl(url)
              .build();
            sheet.getRange(index + 2, cvLinkCol).setRichTextValue(richText);
          }
        }
      });
    }
  });
  console.log("Đã quét và sửa xong toàn bộ lỗi #ERROR!");
}

function anSheetUngVienCuV29() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const oldSheet = ss.getSheetByName(TEN_SHEET.ungVienCu);
  if (oldSheet && !oldSheet.isSheetHidden()) oldSheet.hideSheet();
  return traJson_({ ok: true, message: 'Đã ẩn sheet "Ứng viên" cũ.' });
}

function dinhDangSheetUngVien_(sheet) {
  if (!sheet) return;

  // Bọc try-catch để nếu cột có công thức (Imported/Query) thì bỏ qua không báo lỗi
  try { sheet.setFrozenRows(1); } catch(e) {}

  try { sheet.autoResizeColumns(1, Math.max(sheet.getLastColumn(), UNG_VIEN_HEADERS.length)); } catch(e) {}

  try {
    const headerRange = sheet.getRange(1, 1, 1, UNG_VIEN_HEADERS.length);
    headerRange.setFontWeight("bold").setBackground("#356B58").setFontColor("#FFFFFF").setWrap(true);
  } catch(e) {}

  try {
    const timeCol = UNG_VIEN_HEADERS.indexOf("Thời gian gửi") + 1;
    if (timeCol > 0 && sheet.getMaxRows() > 1) {
      sheet.getRange(2, timeCol, sheet.getMaxRows() - 1, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    }
  } catch(e) {}

  try {
    const cvLinkCol = UNG_VIEN_HEADERS.indexOf("Link file CV") + 1;
    if (cvLinkCol > 0) sheet.setColumnWidth(cvLinkCol, 120);
  } catch(e) {}

  try {
    const deviceCol = UNG_VIEN_HEADERS.indexOf("Thiết bị/Trình duyệt") + 1;
    if (deviceCol > 0) sheet.setColumnWidth(deviceCol, 240);
  } catch(e) {}
}

function taoHoacLaySheet_(ss, tenSheet, headers) {
  let sheet = ss.getSheetByName(tenSheet);
  if (!sheet) sheet = ss.insertSheet(tenSheet);

  const lastCol = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const isEmpty = currentHeaders.every(cell => cell === "");

  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    headers.forEach(header => {
      if (!currentHeaders.includes(header)) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      }
    });
  }
  return sheet;
}

function layHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

function themDuLieuChiNhanhMau_(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;
  const rows = [
    ["Văn phòng chính DFC", "125 Trần Bình Trọng, phường Chợ Quán, TP.HCM (Quận 5 cũ)", 10.75609363585227, 106.6810910436253, "", "", "", "", "Có", "Có"]
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function layChiNhanh_() {
  const rows = docSheetThanhObject_(TEN_SHEET.chiNhanh);
  return rows.filter(row => dangHienThi_(row["Hiển thị"])).map((row, index) => {
    const ten = row["Tên văn phòng/chi nhánh"] || "";
    const diaChi = row["Địa chỉ"] || "";
    const lat = Number(row["Vĩ độ"] || 0);
    const lng = Number(row["Kinh độ"] || 0);
    return {
      id: taoSlug_(ten || ("chi-nhanh-" + index)),
      name: ten, address: diaChi, lat, lng,
      note: row["Ghi chú"] || "", image: row["Link hình ảnh"] || "",
      googleMaps: row["Link Google Maps"] || "", directions: row["Link chỉ đường"] || "",
      isHQ: String(row["Trụ sở chính"] || "").toLowerCase() === "true" || String(row["Trụ sở chính"] || "").toLowerCase() === "có"
    };
  }).filter(row => row.name && row.lat && row.lng);
}

function layHinhAnhVanHoa_() {
  const rows = docSheetThanhObject_(TEN_SHEET.hinhAnh);
  return rows.filter(row => dangHienThi_(row["Hiển thị"])).map(row => ({
    title: row["Tiêu đề"] || "", caption: row["Mô tả ngắn"] || "", image: row["Link hình ảnh"] || ""
  })).filter(row => row.title || row.image);
}

function layCauHinh_() {
  const rows = docSheetThanhObject_(TEN_SHEET.cauHinh);
  const obj = {};
  rows.forEach(row => { if (row["Mục cấu hình"]) obj[row["Mục cấu hình"]] = row["Giá trị"] || ""; });
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
    headers.forEach((header, index) => { obj[header] = row[index]; });
    return obj;
  });
}

function docDuLieuGuiLen_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents); }
  catch (err) {
    if (e.parameter && e.parameter.payload) return JSON.parse(e.parameter.payload);
    throw new Error("Không đọc được dữ liệu gửi lên.");
  }
}

function dangHienThi_(value) {
  const text = String(value || "").trim().toLowerCase();
  return (text === "" || text === "có" || text === "co" || text === "true" || text === "1" || text === "yes" || text === "active");
}

function taoSlug_(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function taoTenFileAnToan_(text) {
  return String(text || "ung-vien").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 60) || "ung-vien";
}

function traJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// THÊM MENU UI CHUNG (CMS + TRAINING)
// ==========================================
function onOpen() {
  try { ensureTrainingSheet_(SpreadsheetApp.openById(SHEET_ID)); } catch (err) { console.warn(err); }
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🌟 HỆ THỐNG UNITE')
    .addItem('Khôi phục/Tạo mới Lịch Training', 'setupTrainingSheet')
    .addItem('Tạo Bảng Nội Dung Web (CMS)', 'setupCMS')
    .addToUi();
}

// ==========================================
// CHỨC NĂNG: CMS TRÊN SHEET
// ==========================================
function setupCMS() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Web_Content');
  if (!sheet) sheet = ss.insertSheet('Web_Content');
  if (sheet.getLastRow() === 0) {
    const headers = ['Trang (Page)', 'Mã vị trí (Key)', 'Nội dung hiển thị (Content)', 'Ghi chú / Hướng dẫn'];
    sheet.getRange(1, 1, 1, 4).setValues([headers])
      .setFontWeight('bold').setBackground('#111111').setFontColor('#d4af37');
  }
  try { sheet.setFrozenRows(1); } catch (err) { console.warn(err); }
  SpreadsheetApp.getUi().alert('Web_Content đã sẵn sàng. Dữ liệu hiện có được giữ nguyên.');
}

// ==========================================
// CHỨC NĂNG: BẢNG LỊCH TRAINING
// ==========================================
function setupTrainingSheet() {
  ensureTrainingSheet_(SpreadsheetApp.openById(SHEET_ID));
  SpreadsheetApp.getUi().alert('Lịch Training đã sẵn sàng. Dữ liệu hiện có được giữ nguyên.');
}

function ensureTrainingSheet_(ss) {
  let sheet = ss.getSheetByName('Training');
  if (sheet) return sheet;
  sheet = ss.insertSheet('Training');
  sheet.getRange('A1:B1').setValues([['Tiêu đề tuần:', 'Lịch Training']]).setFontWeight('bold');
  sheet.getRange(2, 1, 1, 5)
    .setValues([['Ngày', 'Buổi', 'Chủ đề', 'Thời gian & Địa điểm', 'Phân loại']])
    .setFontWeight('bold').setBackground('#ffd700').setHorizontalAlignment('center');
  sheet.getRange('A3:A100').setDataValidation(
    SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());
  try { sheet.getRange('A3:A100').setNumberFormat('dd/MM/yyyy'); }
  catch (err) { console.warn('Không đặt được định dạng ngày: ' + err); }
  sheet.getRange('B3:B100').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Sáng', 'Chiều'], true).build());
  sheet.getRange('E3:E100').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Bắt buộc cho Newbie', 'Bắt buộc', 'Mở rộng', 'Tùy chọn'], true).build());
  sheet.setColumnWidth(1, 110); sheet.setColumnWidth(2, 120); sheet.setColumnWidth(3, 350);
  sheet.setColumnWidth(4, 250); sheet.setColumnWidth(5, 180);
  return sheet;
}

function luuNoiDungCms_(payload) {
  const savedPassword = PropertiesService.getScriptProperties().getProperty("CMS_ADMIN_PASSWORD") || "";
  const suppliedPassword = String(payload.password || "");
  if (savedPassword.length < 12) throw new Error("Chưa cấu hình mật khẩu CMS trong Script properties.");
  if (suppliedPassword !== savedPassword) throw new Error("Mật khẩu quản trị không đúng.");

  const page = String(payload.page || "").trim();
  const key = String(payload.key || "").trim();
  const value = String(payload.value || "").trim();
  if (!["index", "nha-nguyen-can", "tpa"].includes(page)) throw new Error("Trang không hợp lệ.");
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(key)) throw new Error("Mã nội dung không hợp lệ.");
  if (!value || value.length > 4000 || /^=/.test(value)) throw new Error("Nội dung trống, quá dài hoặc không hợp lệ.");

  // Chỉ cho sửa các vị trí data-cms thực sự tồn tại trên trang tương ứng.
  const url = "https://unitemedia2010-oss.github.io/JD_UNITEGROUP/" +
    (page === "index" ? "index.html" : page + ".html");
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200 ||
      !response.getContentText().includes('data-cms="' + key + '"')) {
    throw new Error("Không tìm thấy vị trí nội dung trên web đã xuất bản.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName("Web_Content");
    if (!sheet) sheet = ss.insertSheet("Web_Content");
    const headers = ["Trang (Page)", "Mã vị trí (Key)", "Nội dung hiển thị (Content)", "Ghi chú / Hướng dẫn"];
    if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, 4).setValues([headers]);
    const rows = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues()
      : [];
    const matches = rows.map((row, index) =>
      String(row[0]).trim() === page && String(row[1]).trim() === key ? index + 2 : 0
    ).filter(Boolean);
    if (matches.length) {
      matches.forEach(rowNumber => sheet.getRange(rowNumber, 3).setValue(value));
    } else {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, 3).setValues([[page, key, value]]);
    }
    SpreadsheetApp.flush();
    return { ok: true, page: page, key: key };
  } finally {
    lock.releaseLock();
  }
}
