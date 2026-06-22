/**
 * UNITE GROUP / UNITE CENTRAL REAL CAREER JD
 * V29 - TÁCH RIÊNG SHEET ỨNG VIÊN
 *
 * Phân luồng tự động:
 * - Trang Căn hộ          -> sheet "Ứng viên Căn hộ"
 * - Trang Nhà nguyên căn -> sheet "Ứng viên UCR"
 *
 * File CV cũng được tách vào 2 thư mục Google Drive riêng.
 *
 * Sau khi dán code:
 * 1) Chạy setupCareerSheetsV29()
 * 2) Deploy phiên bản mới
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
    version: "V29_SEPARATE_UCR_SHEET",
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
      version: "V29_SEPARATE_UCR_SHEET",
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
    source.includes("ucr") ||
    source.includes("nha-nguyen-can") ||
    position.includes("nhà nguyên căn") ||
    position.includes("nha nguyen can") ||
    position.includes("unite central real");

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
        sheet.getRange(lastRow, cvUrlCol)
          .setFormula('=HYPERLINK("' + cvUrl.replace(/"/g, '""') + '","Mở CV")');
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

/**
 * Chuyển dữ liệu sheet "Ứng viên" cũ sang 2 sheet mới.
 * Chỉ chạy 1 lần nếu Hạnh muốn dọn dữ liệu cũ.
 */
function chuyenDuLieuUngVienCuV29() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const oldSheet = ss.getSheetByName(TEN_SHEET.ungVienCu);

  if (!oldSheet) {
    return traJson_({
      ok: true,
      message: 'Không tìm thấy sheet "Ứng viên" cũ.'
    });
  }

  const values = oldSheet.getDataRange().getValues();
  if (values.length < 2) {
    return traJson_({
      ok: true,
      message: 'Sheet "Ứng viên" cũ chưa có dữ liệu.'
    });
  }

  const headers = values[0].map(String);
  let canHoCount = 0;
  let ucrCount = 0;

  values.slice(1).forEach(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);

    const channel = xacDinhKenhTuyenDung_({
      source: obj["Nguồn ứng tuyển"] || "",
      position: obj["Vị trí ứng tuyển"] || ""
    });

    const targetSheet = taoHoacLaySheet_(
      ss,
      channel.sheetName,
      UNG_VIEN_HEADERS
    );

    const targetHeaders = layHeaders_(targetSheet);
    const targetRow = targetHeaders.map(header =>
      obj[header] !== undefined ? obj[header] : ""
    );

    targetSheet.appendRow(targetRow);

    if (channel.sheetName === TEN_SHEET.ungVienUcr) {
      ucrCount++;
    } else {
      canHoCount++;
    }
  });

  dinhDangSheetUngVien_(ss.getSheetByName(TEN_SHEET.ungVienCanHo));
  dinhDangSheetUngVien_(ss.getSheetByName(TEN_SHEET.ungVienUcr));

  return traJson_({
    ok: true,
    message: "Đã chuyển dữ liệu cũ sang 2 sheet mới.",
    canHo: canHoCount,
    ucr: ucrCount
  });
}

/**
 * Chỉ ẩn sheet cũ, không xóa dữ liệu.
 */
function anSheetUngVienCuV29() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const oldSheet = ss.getSheetByName(TEN_SHEET.ungVienCu);

  if (oldSheet && !oldSheet.isSheetHidden()) {
    oldSheet.hideSheet();
  }

  return traJson_({
    ok: true,
    message: 'Đã ẩn sheet "Ứng viên" cũ nếu tồn tại.'
  });
}

function dinhDangSheetUngVien_(sheet) {
  if (!sheet) return;

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, Math.max(sheet.getLastColumn(), UNG_VIEN_HEADERS.length));

  const headerRange = sheet.getRange(1, 1, 1, UNG_VIEN_HEADERS.length);
  headerRange
    .setFontWeight("bold")
    .setBackground("#356B58")
    .setFontColor("#FFFFFF")
    .setWrap(true);

  const timeCol = UNG_VIEN_HEADERS.indexOf("Thời gian gửi") + 1;
  if (timeCol > 0 && sheet.getMaxRows() > 1) {
    sheet.getRange(2, timeCol, sheet.getMaxRows() - 1, 1)
      .setNumberFormat("dd/MM/yyyy HH:mm");
  }

  const cvLinkCol = UNG_VIEN_HEADERS.indexOf("Link file CV") + 1;
  if (cvLinkCol > 0) {
    sheet.setColumnWidth(cvLinkCol, 120);
  }

  const deviceCol = UNG_VIEN_HEADERS.indexOf("Thiết bị/Trình duyệt") + 1;
  if (deviceCol > 0) {
    sheet.setColumnWidth(deviceCol, 240);
  }
}

function taoHoacLaySheet_(ss, tenSheet, headers) {
  let sheet = ss.getSheetByName(tenSheet);
  if (!sheet) sheet = ss.insertSheet(tenSheet);

  const lastCol = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(String);

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
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(String);
}

function themDuLieuChiNhanhMau_(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;

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

      const maps =
        row["Link Google Maps"] ||
        ("https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(diaChi || (lat + "," + lng)));

      const directions =
        row["Link chỉ đường"] ||
        ("https://www.google.com/maps/dir/?api=1&destination=" +
          encodeURIComponent(diaChi || (lat + "," + lng)) +
          "&travelmode=driving");

      return {
        id: taoSlug_(ten || ("chi-nhanh-" + index)),
        name: ten,
        address: diaChi,
        lat,
        lng,
        note: row["Ghi chú"] || "",
        image: row["Link hình ảnh"] || "",
        googleMaps: maps,
        directions,
        isHQ:
          String(row["Trụ sở chính"] || "").toLowerCase() === "true" ||
          String(row["Trụ sở chính"] || "").toLowerCase() === "có"
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
    if (row["Mục cấu hình"]) {
      obj[row["Mục cấu hình"]] = row["Giá trị"] || "";
    }
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
    if (e.parameter && e.parameter.payload) {
      return JSON.parse(e.parameter.payload);
    }
    throw new Error("Không đọc được dữ liệu gửi lên.");
  }
}

function dangHienThi_(value) {
  const text = String(value || "").trim().toLowerCase();

  return (
    text === "" ||
    text === "có" ||
    text === "co" ||
    text === "true" ||
    text === "1" ||
    text === "yes" ||
    text === "active"
  );
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
