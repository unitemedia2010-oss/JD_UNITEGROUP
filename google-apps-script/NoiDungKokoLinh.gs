/**
 * =====================================================================
 *  HỆ THỐNG QUẢN LÝ NỘI DUNG — KOKO LINH / LINH ĐỊA ỐC SÀI GÒN
 * =====================================================================
 *  DÙNG: Tạo 1 Google Sheet trống → Extensions > Apps Script
 *        → dán toàn bộ file này → Save → chọn hàm "taoHeThong" → Run
 *
 *  Hệ thống tự tạo 6 tab, dropdown, công thức hạn chót tự động,
 *  cảnh báo trễ hạn và dashboard tổng hợp.
 *
 *  Mỗi tuần chỉ cần bấm menu "Sinh tuần mới".
 * =====================================================================
 */

/* =====================================================================
 *  PHẦN 1 — HẰNG SỐ & DANH MỤC
 * ===================================================================== */

var TEN = {
  CAU_HINH: 'CauHinh',
  LICH_QUAY: 'LichQuay',
  LICH_DANG: 'LichDang',
  KHO_CLIP: 'KhoClip',
  DASHBOARD: 'Dashboard',
  LS_CU: 'LichSuCu'
};

// Tên hiển thị có dấu (Google Sheet cho phép)
var NHAN = {
  CAU_HINH: 'Cấu hình',
  LICH_QUAY: 'Lịch quay',
  LICH_DANG: 'Lịch đăng',
  KHO_CLIP: 'Kho clip',
  DASHBOARD: 'Dashboard',
  LS_CU: 'Lịch sử cũ'
};

var DANH_MUC = {
  kenh: ['Koko Linh', 'Linh Địa Ốc Sài Gòn'],
  loai: ['Trải nghiệm', 'Nhà'],
  dinhDang: ['Reel / Short', 'TikTok', 'Facebook', 'Story', 'Bài đăng'],
  kb: ['Chưa viết', 'Đang viết', 'Đã viết', 'Đã duyệt'],
  quay: ['Chưa quay', 'Đã hẹn', 'Đang quay', 'Đã quay'],
  dung: ['Chưa dựng', 'Đang dựng', 'Đã dựng'],
  duyet: ['Chưa duyệt', 'Đang duyệt', 'Đã duyệt'],
  trangThaiDang: ['Chưa đăng', 'Đã lên lịch', 'Đã đăng', 'Tạm ẩn'],
  lead: ['Chưa gọi', 'Đã gọi', 'Hẹn xem nhà', 'Chốt', 'Không phù hợp'],
  trangThaiQuay: ['Chưa chốt', 'Đã chốt', 'Đang quay', 'Hoàn thành', 'Hủy'],
  tinhTrangClip: ['Tồn kho', 'Đã lên kế hoạch', 'Đang dùng', 'Hết'],
  gioDang: ['09:00', '10:00', '12:00', '15:00', '18:00', '20:00', '21:00'],
  ngayTrongTuan: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
};

// Vị trí ô trong tab Cấu hình
var CF = {
  kenhTN: 2,   // B2  kênh trải nghiệm
  kenhNHA: 3,  // B3  kênh bất động sản
  soClipTN: 4, // B4  số clip trải nghiệm mỗi tuần
  soClipNHA: 5,
  soQuayTN: 6, // số buổi quay trải nghiệm mỗi tuần
  soQuayNHA: 7,
  leKB: 8,     // số ngày cho kịch bản
  leQuay: 9,   // số ngày cho quay
  leDung: 10,  // số ngày cho dựng
  gioTN: 11,   // giờ đăng trải nghiệm
  gioNHA: 12,  // giờ đăng nhà
  nganSach: 13,// ngân sách quay mỗi tuần
  dsNhanSu: 2  // E2 trở xuống
};

/* =====================================================================
 *  PHẦN 2 — TIỆN ÍCH
 * ===================================================================== */

function laySS() {
  return SpreadsheetApp.getActive();
}

/** Lấy hoặc tạo tab theo tên hiển thị */
function laySheet(ss, nhan) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === nhan) return sheets[i];
  }
  return ss.insertSheet(nhan);
}

/** Ngày thứ Hai của tuần chứa d */
function thuHaiTrongTuan(d) {
  var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var thu = x.getDay();          // 0=CN .. 6=T7
  var lech = thu === 0 ? -6 : 1 - thu;
  x.setDate(x.getDate() + lech);
  return x;
}

/** Định dạng ngày dd/MM/yyyy */
function ngay(d) {
  if (!d) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy');
}

/** Ghi giá trị ngày vào ô (Apps Script cần Date object) */
function ghiNgay(sh, row, col, d) {
  if (d) sh.getRange(row, col).setValue(new Date(d.getTime()));
}

/** Tô đậm + màu nền dòng tiêu đề */
function vietTieuDe(sh, tenCot, mauNen) {
  sh.getRange(1, 1, 1, tenCot.length).setValues([tenCot]);
  sh.getRange(1, 1, 1, tenCot.length)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground(mauNen || '#356B58')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 34);
}

/** Tạo dropdown 1 cột */
function taoDropdown(sh, col, danhSach, soDong) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(danhSach, true)
    .setAllowInvalid(false)
    .build();
  sh.getRange(2, col, soDong, 1).setDataValidation(rule);
}

/** Tô màu cảnh báo */
function toMauCanhBao(sh, cot, soDong) {
  var r = sh.getRange(2, cot, soDong, 1);
  var quyTac = [
    { text: 'Trễ', bg: '#F8CBCB', fg: '#8B0000' },
    { text: 'Chưa đăng', bg: '#FFE0A3', fg: '#7A5200' },
    { text: 'OK', bg: '#CDE8CF', fg: '#14532D' }
  ];
  quyTac.forEach(function (q) {
    r.setConditionalFormattingRules([SpreadsheetApp.newConditionalFormattingRule()
      .whenTextContains(q.text)
      .setBackground(q.bg)
      .setForeground(q.fg)
      .setRanges([r])
      .build()]);
  });
}

/** Bỏ mọi định dạng có sẵn của tab */
function donDep(sh) {
  // Luu y: clearDataValidations() la method cua Range, KHONG co o Sheet.
  sh.clearConditionalFormatRules();
  try {
    sh.getDataRange().clearDataValidations();
  } catch (e) {
    console.warn('Khong xoa duoc data validation cu: ' + e.message);
  }
}

/* =====================================================================
 *  PHẦN 3 — TẠO TAB CẤU HÌNH
 * ===================================================================== */

function taoCauHinh(ss) {
  var sh = laySheet(ss, NHAN.CAU_HINH);
  sh.clear();
  donDep(sh);

  vietTieuDe(sh, ['Tham số', 'Giá trị', 'Ghi chú'], '#8B5E00');

  var hang = [
    ['Kênh trải nghiệm', 'Koko Linh', 'Kênh 1 — branding cá nhân'],
    ['Kênh bất động sản', 'Linh Địa Ốc Sài Gòn', 'Kênh 2 — chốt khách thuê'],
    ['Số clip trải nghiệm / tuần', 2, 'Mặc định theo JD'],
    ['Số clip nhà / tuần', 3, 'Mặc định theo JD'],
    ['Số buổi quay trải nghiệm / tuần', 3, 'Nhiều hơn để tích clip dự phòng'],
    ['Số buổi quay nhà / tuần', 4, 'Nhiều hơn để tích clip dự phòng'],
    ['Số ngày cho Kịch bản', 5, 'Tính ngược từ ngày đăng'],
    ['Số ngày cho Quay', 3, 'Tính ngược từ ngày đăng'],
    ['Số ngày cho Dựng', 1, 'Tính ngược từ ngày đăng'],
    ['Giờ đăng trải nghiệm', '10:00', 'Buổi sáng'],
    ['Giờ đăng nhà', '20:00', 'Giờ cao điểm khách xem BĐS'],
    ['Ngân sách quay / tuần (đ)', 3000000, 'Dùng để so với chi phí thực tế'],
    ['Ngày bắt đầu tuần', 'Thứ 2', 'Dùng cho sinh tuần']
  ];
  sh.getRange(2, 1, hang.length, 3).setValues(hang);
  sh.getRange(14, 2).setNumberFormat('#,##0');
  sh.getRange(2, 1, hang.length, 1).setFontWeight('bold');

  // Danh sách nhân sự (cột E) — KHÔNG bắt buộc, ai nhận việc thì điền
  sh.getRange('E1').setValue('DANH SÁCH NHÂN SỰ').setFontWeight('bold')
    .setFontColor('#FFFFFF').setBackground('#356B58');
  sh.getRange('E2').setValue('(ghi tên, mỗi người 1 dòng)').setFontStyle('italic');

  sh.setColumnWidth(1, 260);
  sh.setColumnWidth(2, 200);
  sh.setColumnWidth(3, 260);
  sh.setColumnWidth(5, 200);

  taoDropdown(sh, 2, DANH_MUC.kenh.concat(['—']), 1);
  taoDropdown(sh, 14, DANH_MUC.ngayTrongTuan, 1);

  sh.getRange('A1').setNote('Đổi các tham số ở đây. Hạn chót trong Lịch đăng tự tính theo số ngày cho Kịch bản / Quay / Dựng.');
  return sh;
}

/** Đọc giá trị cấu hình */
function giaTri(ss, o) {
  var sh = ss.getSheetByName(NHAN.CAU_HINH);
  if (!sh) return '';
  var v = sh.getRange(o, 2).getValue();
  return v === null || v === undefined ? '' : v;
}

/** Lấy danh sách nhân sự (bỏ dòng gợi ý) */
function danhSachNhanSu(ss) {
  var sh = ss.getSheetByName(NHAN.CAU_HINH);
  if (!sh) return [];
  var vals = sh.getRange(CF.dsNhanSu, 5, 40, 1).getValues();
  var ra = [];
  vals.forEach(function (r) {
    var v = String(r[0]).trim();
    if (v && v.indexOf('ghi tên') === -1) ra.push(v);
  });
  return ra;
}

/* =====================================================================
 *  PHẦN 4 — TẠO TAB LỊCH ĐĂNG
 * ===================================================================== */

var C_DANG = [
  'ID', 'Tuần', 'Kênh', 'Loại', 'Ngày đăng', 'Thứ', 'Giờ đăng', 'Tên clip',
  'Định dạng', 'Kịch bản', 'Hạn Kịch bản', 'Người viết KB',
  'Quay', 'Hạn quay', 'Người quay',
  'Dựng', 'Hạn dựng',
  'Duyệt', 'Người duyệt',
  'Trạng thái đăng', 'Người đăng', 'Caption / Hook', 'Link bài',
  'Lượt xem', 'Like', 'Bình luận', 'Chia sẻ', 'Lưu',
  'Khách nhắn', 'Xử lý lead', 'Còn (ngày)', 'Cảnh báo', 'Cần vai trò xử lý'
];

function taoLichDang(ss) {
  var sh = laySheet(ss, NHAN.LICH_DANG);
  sh.clear();
  donDep(sh);
  vietTieuDe(sh, C_DANG, '#C2185B');

  var soDong = 400;
  var r = sh.getRange(2, 1, soDong, C_DANG.length);

  // Cột B — tuần: mặc định tuần hiện tại
  sh.getRange(2, 2, soDong, 1).setNumberFormat('dd/MM/yyyy');
  sh.getRange(2, 5, soDong, 1).setNumberFormat('dd/MM/yyyy');

  // F — Thứ
  sh.getRange(2, 6, soDong, 1).setFormulaR1C1(
    '=IF(RC[0]="","",TEXT(RC[-1],"dddd"))');

  // K, N, Q — hạn chót tính ngược từ ngày đăng
  var cHinh = "'" + NHAN.CAU_HINH + "'!$B$";
  sh.getRange(2, 11, soDong, 1).setFormulaR1C1(
    '=IF(RC[-6]="","",RC[-6]-' + cHinh + CF.leKB + ')');
  sh.getRange(2, 14, soDong, 1).setFormulaR1C1(
    '=IF(RC[-9]="","",RC[-9]-' + cHinh + CF.leQuay + ')');
  sh.getRange(2, 17, soDong, 1).setFormulaR1C1(
    '=IF(RC[-12]="","",RC[-12]-' + cHinh + CF.leDung + ')');
  [11, 14, 17].forEach(function (c) {
    sh.getRange(2, c, soDong, 1).setNumberFormat('dd/MM');
  });

  // AE(31) — còn bao nhiêu ngày. Cùng cột = RC[0], lùi 26 cột = cột E (Ngày đăng)
  sh.getRange(2, 31, soDong, 1).setFormulaR1C1(
    '=IF(RC[-26]="","",RC[-26]-TODAY())');

  // AF(32) — cảnh báo. Tính lại offset từ cột 32:
  //   J=10 (Kịch bản) RC[-22] | K=11 (Hạn KB) RC[-21]
  //   M=13 (Quay)      RC[-19] | N=14 (Hạn quay) RC[-18]
  //   P=16 (Dựng)     RC[-16] | Q=17 (Hạn dựng) RC[-15]
  //   T=20 (Đăng)     RC[-12] | E=5  (Ngày đăng) RC[-27]
  sh.getRange(2, 32, soDong, 1).setFormulaR1C1(
    '=IF(RC[-27]="","",' +
    'IF(AND(RC[-22]<>"Đã duyệt",RC[-21]<TODAY()),"Trễ kịch bản",' +
    'IF(AND(RC[-19]<>"Đã quay",RC[-18]<TODAY()),"Trễ quay",' +
    'IF(AND(RC[-16]<>"Đã dựng",RC[-15]<TODAY()),"Trễ dựng",' +
    'IF(AND(RC[-12]<>"Đã đăng",RC[-27]<TODAY()),"Chưa đăng","OK")))))');

  sh.getRange(2, 33, soDong, 1).setFormulaR1C1(
    '=IF(RC[-1]="","",' +
    'IF(RC[-1]="Trễ kịch bản","Kịch bản",' +
    'IF(RC[-1]="Trễ quay","Hẹn lịch + Media",' +
    'IF(RC[-1]="Trễ dựng","Media",' +
    'IF(RC[-1]="Chưa đăng","Creator Main","—")))))');

  // Dropdown
  var nhanSu = danhSachNhanSu(ss);
  taoDropdown(sh, 3, DANH_MUC.kenh, soDong);
  taoDropdown(sh, 4, DANH_MUC.loai, soDong);
  taoDropdown(sh, 7, DANH_MUC.gioDang, soDong);
  taoDropdown(sh, 9, DANH_MUC.dinhDang, soDong);
  taoDropdown(sh, 10, DANH_MUC.kb, soDong);
  taoDropdown(sh, 13, DANH_MUC.quay, soDong);
  taoDropdown(sh, 16, DANH_MUC.dung, soDong);
  taoDropdown(sh, 18, DANH_MUC.duyet, soDong);
  taoDropdown(sh, 20, DANH_MUC.trangThaiDang, soDong);
  taoDropdown(sh, 30, DANH_MUC.lead, soDong);
  [12, 15, 19, 21].forEach(function (c) {
    taoDropdown(sh, c, nhanSu.length ? nhanSu : ['(ghi tên ở Cấu hình E)'], soDong);
  });

  toMauCanhBao(sh, 32, soDong);

  // Định dạng số liệu
  sh.getRange(2, 24, soDong, 6).setNumberFormat('#,##0');

  // Bề rộng cột
  var rong = [40, 80, 130, 80, 90, 70, 70, 200, 90, 90, 90, 100,
    90, 90, 100, 90, 90, 90, 100, 100, 100, 300, 160,
    80, 70, 80, 70, 70, 80, 110, 70, 100, 120];
  rong.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });

  sh.getRange('A1').setNote('Ngày đăng là dữ liệu gốc. Hạn Kịch bản / quay / dựng tự tính ngược — chỉ cần sửa ô Ngày đăng.');
  return sh;
}

/* =====================================================================
 *  PHẦN 5 — TẠO TAB LỊCH QUAY
 * ===================================================================== */

var C_QUAY = [
  'ID', 'Tuần', 'Kênh', 'Loại', 'Ngày quay', 'Thứ', 'Giờ bắt đầu',
  'Nội dung buổi quay', 'Địa điểm', 'Thời lượng',
  'Chi phí dự kiến', 'Người hẹn', 'Người quay (Media)',
  'Trạng thái', 'Ngày hoàn thành', 'Link tư liệu quay',
  'Số clip dự kiến', 'Cảnh báo'
];

function taoLichQuay(ss) {
  var sh = laySheet(ss, NHAN.LICH_QUAY);
  sh.clear();
  donDep(sh);
  vietTieuDe(sh, C_QUAY, '#1E6F5C');

  var soDong = 300;
  sh.getRange(2, 2, soDong, 1).setNumberFormat('dd/MM/yyyy');
  sh.getRange(2, 5, soDong, 1).setNumberFormat('dd/MM/yyyy');
  sh.getRange(2, 15, soDong, 1).setNumberFormat('dd/MM/yyyy');

  sh.getRange(2, 6, soDong, 1).setFormulaR1C1(
    '=IF(RC[-1]="","",TEXT(RC[-1],"dddd"))');

  sh.getRange(2, 18, soDong, 1).setFormulaR1C1(
    '=IF(RC[-13]="","",' +
    'IF(AND(RC[-13]<TODAY(),RC[-4]<>"Hoàn thành",RC[-4]<>"Hủy",RC[-4]<>"Đang quay"),"Trễ buổi quay",' +
    'IF(RC[-4]="Hoàn thành","OK","Đang kế hoạch")))');

  var nhanSu = danhSachNhanSu(ss);
  var ds = nhanSu.length ? nhanSu : ['(ghi tên ở Cấu hình E)'];

  taoDropdown(sh, 3, DANH_MUC.kenh, soDong);
  taoDropdown(sh, 4, DANH_MUC.loai, soDong);
  taoDropdown(sh, 7, DANH_MUC.gioDang, soDong);
  taoDropdown(sh, 12, ds, soDong);
  taoDropdown(sh, 13, ds, soDong);
  taoDropdown(sh, 14, DANH_MUC.trangThaiQuay, soDong);

  toMauCanhBao(sh, 18, soDong);

  sh.getRange(2, 11, soDong, 1).setNumberFormat('#,##0');

  var rong = [40, 80, 130, 80, 90, 70, 80, 220, 260, 90,
    110, 100, 120, 110, 100, 180, 90, 120];
  rong.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });

  return sh;
}

/* =====================================================================
 *  PHẦN 6 — TẠO TAB KHO CLIP
 * ===================================================================== */

function taoKhoClip(ss) {
  var sh = laySheet(ss, NHAN.KHO_CLIP);
  sh.clear();
  donDep(sh);
  vietTieuDe(sh, [
    'ID', 'Tên clip', 'Kênh', 'Loại', 'Ngày quay', 'Nguồn',
    'Tình trạng', 'Dự kiến đăng tuần', 'Link clip', 'Ghi chú'
  ], '#5D4037');

  var soDong = 300;
  sh.getRange(2, 5, soDong, 1).setNumberFormat('dd/MM/yyyy');
  sh.getRange(2, 8, soDong, 1).setNumberFormat('dd/MM/yyyy');

  taoDropdown(sh, 3, DANH_MUC.kenh, soDong);
  taoDropdown(sh, 4, DANH_MUC.loai, soDong);
  taoDropdown(sh, 7, DANH_MUC.tinhTrangClip, soDong);

  [50, 220, 130, 80, 90, 140, 130, 110, 180, 200].forEach(function (w, i) {
    sh.setColumnWidth(i + 1, w);
  });
  return sh;
}

/* =====================================================================
 *  PHẦN 7 — DASHBOARD
 * ===================================================================== */

function taoDashboard(ss) {
  var sh = laySheet(ss, NHAN.DASHBOARD);
  sh.clear();
  donDep(sh);

  sh.getRange('A1').setValue('DASHBOARD NỘI DUNG — KOKO LINH')
    .setFontSize(18).setFontWeight('bold').setFontColor('#8B5E00');

  sh.getRange('A3').setValue('Chọn tuần (thứ Hai của tuần):');
  sh.getRange('B3').setValue(thuHaiTrongTuan(new Date()));
  sh.getRange('B3').setNumberFormat('dd/MM/yyyy').setFontWeight('bold');
  sh.getRange('B3').setBackground('#FFF3C4');

  var D = NHAN.LICH_DANG, Q = NHAN.LICH_QUAY, C = NHAN.CAU_HINH;
  var dong = 5;
  var hang = [];

  function muc(tieuDe, nhan) {
    sh.getRange(dong, 1).setValue(tieuDe).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#8B5E00');
    sh.getRange(dong, 2).setValue(nhan).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#8B5E00');
    sh.getRange(dong, 3).setValue('').setBackground('#8B5E00');
    dong++;
  }

  muc('SẢN XUẤT', 'TUẦN');
  hang = [
    ['Buổi quay đã chốt',
      '=COUNTIFS(\'' + Q + '\'!$B:$B,$B$3,\'' + Q + '\'!$N:$N,"<>Hủy")',
      'mục tiêu: ' + '={{qTN}}+{{qNHA}} buổi'],
    ['Clip đăng trong tuần',
      '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3)',
      'mục tiêu: ' + '={{cTN}}+{{cNHA}} clip'],
    ['Clip đã đăng',
      '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$T:$T,"Đã đăng")', ''],
    ['Chi phí quay dự kiến',
      '=SUMIFS(\'' + Q + '\'!$K:$K,\'' + Q + '\'!$B:$B,$B$3)',
      'ngân sách: ' + '={{ns}}'],
    ['Chi phí quay thực tế',
      '=SUMIFS(\'' + Q + '\'!$K:$K,\'' + Q + '\'!$B:$B,$B$3,\'' + Q + '\'!$N:$N,"Hoàn thành")', '']
  ];

  var chi = hang.map(function (h, i) {
    if (i === 0) h[2] = h[2].replace('{{qTN}}', giaTri(ss, CF.soQuayTN)).replace('{{qNHA}}', giaTri(ss, CF.soQuayNHA));
    if (i === 1) h[2] = h[2].replace('{{cTN}}', giaTri(ss, CF.soClipTN)).replace('{{cNHA}}', giaTri(ss, CF.soClipNHA));
    if (i === 3) h[2] = h[2].replace('{{ns}}', Number(giaTri(ss, CF.nganSach)).toLocaleString('vi-VN'));
    return h;
  });

  sh.getRange(dong, 1, chi.length, 3).setValues(chi);
  sh.getRange(dong + 0, 2, chi.length, 1).setNumberFormat('#,##0');
  sh.getRange(dong + 3, 2, 2, 1).setNumberFormat('#,##0');
  sh.getRange(dong, 1, chi.length, 1).setFontWeight('bold');
  dong += chi.length + 1;

  muc('TIẾN ĐỘ 4 KHÂU', 'TỈ LỆ');
  var tienDo = [
    ['1. Kịch bản',
      '=IFERROR(COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$J:$J,"Đã duyệt")/COUNTIF(\'' + D + '\'!$B:$B,$B$3),"")'],
    ['2. Hẹn lịch & Quay',
      '=IFERROR(COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$M:$M,"Đã quay")/COUNTIF(\'' + D + '\'!$B:$B,$B$3),"")'],
    ['3. Media dựng',
      '=IFERROR(COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$P:$P,"Đã dựng")/COUNTIF(\'' + D + '\'!$B:$B,$B$3),"")'],
    ['4. Creator duyệt & đăng',
      '=IFERROR(COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$T:$T,"Đã đăng")/COUNTIF(\'' + D + '\'!$B:$B,$B$3),"")']
  ];
  sh.getRange(dong, 1, tienDo.length, 2).setValues(tienDo);
  sh.getRange(dong, 2, tienDo.length, 1).setNumberFormat('0%');
  sh.getRange(dong, 1, tienDo.length, 1).setFontWeight('bold');
  dong += tienDo.length + 1;

  muc('KẾT QUẢ', 'TUẦN NÀY');
  var ketQua = [
    ['Tổng lượt xem',
      '=SUMIFS(\'' + D + '\'!$X:$X,\'' + D + '\'!$B:$B,$B$3)'],
    ['Tổng tương tác',
      '=SUMIFS(\'' + D + '\'!$Y:$Y,\'' + D + '\'!$B:$B,$B$3)+SUMIFS(\'' + D + '\'!$Z:$Z,\'' + D + '\'!$B:$B,$B$3)+SUMIFS(\'' + D + '\'!$AA:$AA,\'' + D + '\'!$B:$B,$B$3)'],
    ['Khách nhắn tin (lead)',
      '=SUMIFS(\'' + D + '\'!$AC:$AC,\'' + D + '\'!$B:$B,$B$3)'],
    ['Lead đã xử lý',
      '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$AD:$AD,"Chốt")+COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$AD:$AD,"Hẹn xem nhà")'],
    ['Tỷ lệ view → lead (%)',
      '=IFERROR(SUMIFS(\'' + D + '\'!$AC:$AC,\'' + D + '\'!$B:$B,$B$3)/SUMIFS(\'' + D + '\'!$X:$X,\'' + D + '\'!$B:$B,$B$3)*100,"")']
  ];
  sh.getRange(dong, 1, ketQua.length, 2).setValues(ketQua);
  sh.getRange(dong, 2, 4, 1).setNumberFormat('#,##0');
  sh.getRange(dong + 4, 2).setNumberFormat('0.00');
  sh.getRange(dong, 1, ketQua.length, 1).setFontWeight('bold');
  dong += ketQua.length + 1;

  muc('CẢNH BÁO', 'SỐ LƯỢNG');
  var canhBao = [
    ['Việc trễ hạn',
      '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$AF:$AF,"Trễ*")'],
    ['Clip quá hạn chưa đăng',
      '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$AF:$AF,"Chưa đăng")'],
    ['Buổi quay trễ',
      '=COUNTIFS(\'' + Q + '\'!$B:$B,$B$3,\'' + Q + '\'!$R:$R,"Trễ*")'],
    ['Chi phí vượt ngân sách',
      '=IF(SUMIFS(\'' + Q + '\'!$K:$K,\'' + Q + '\'!$B:$B,$B$3)>\'' + C + '\'!$B$' + CF.nganSach + ',"CÓ","")']
  ];
  sh.getRange(dong, 1, canhBao.length, 2).setValues(canhBao);
  sh.getRange(dong, 1, canhBao.length, 1).setFontWeight('bold');
  dong += canhBao.length + 1;

  muc('TOP 3 CLIP TUẦN', 'LƯỢT XEM');
  // FILTER/SORT chay nhu cong thuc binh thuong, khong can Ctrl+Shift+Enter
  var locClip =
    '((\'' + D + '\'!$B$2:$B$400=$B$3)*(\'' + D + '\'!$X$2:$X$400>0))';
  var tenClip = 'SORT(FILTER(\'' + D + '\'!$H$2:$H$400,' + locClip + ',1,-1))';
  var viewClip = 'SORT(FILTER(\'' + D + '\'!$X$2:$X$400,' + locClip + ',1,-1))';
  sh.getRange(dong, 1, 4, 2).setValues([
    ['Tên clip', 'Lượt xem'],
    ['=IFERROR(INDEX(' + tenClip + ',1),"—")',
      '=IFERROR(INDEX(' + viewClip + ',1),"")'],
    ['=IFERROR(INDEX(' + tenClip + ',2),"—")',
      '=IFERROR(INDEX(' + viewClip + ',2),"")'],
    ['=IFERROR(INDEX(' + tenClip + ',3),"—")',
      '=IFERROR(INDEX(' + viewClip + ',3),"")']
  ]);
  sh.getRange(dong, 2, 4, 1).setNumberFormat('#,##0');
  dong += 6;

  sh.getRange(dong, 1).setValue('SO SÁNH VỚI TUẦN TRƯỚC');
  dong++;
  sh.getRange(dong, 1, 3, 3).setValues([
    ['Chỉ số', 'Tuần trước', 'Tuần này'],
    ['Clip đã đăng', '', ''],
    ['Tổng lượt xem', '', '']
  ]);
  sh.getRange(dong, 1, 3, 1).setFontWeight('bold');
  var truoc = dong + 1;
  sh.getRange(truoc, 2).setFormula(
    '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3-7,\'' + D + '\'!$T:$T,"Đã đăng")');
  sh.getRange(truoc, 3).setFormula(
    '=COUNTIFS(\'' + D + '\'!$B:$B,$B$3,\'' + D + '\'!$T:$T,"Đã đăng")');
  sh.getRange(truoc + 1, 2).setFormula(
    '=SUMIFS(\'' + D + '\'!$X:$X,\'' + D + '\'!$B:$B,$B$3-7)');
  sh.getRange(truoc + 1, 3).setFormula(
    '=SUMIFS(\'' + D + '\'!$X:$X,\'' + D + '\'!$B:$B,$B$3)');
  sh.getRange(truoc, 2, 2, 2).setNumberFormat('#,##0');

  sh.setColumnWidth(1, 250);
  sh.setColumnWidth(2, 150);
  sh.setColumnWidth(3, 200);
  return sh;
}

/* =====================================================================
 *  PHẦN 8 — MIGRATE LỊCH SỨ CŨ
 * ===================================================================== */

var CU_QUAY = [
  ['29/09/2026', '', '', '139 Bắc Hải quận 10', '500k', '60p'],
  ['29/09/2026', '', '', 'Chưa chốt', '', ''],
  ['01/10/2026', 'Thứ 5', '19:00', '139 Bắc Hải quận 10', '500k', '60p'],
  ['03/10/2026', 'Thứ 7', '09:00', 'Jèwem Jewelry Nguyễn Thị Huỳnh Phú nhuận', '550k', '4h trải nghiệm'],
  ['03/10/2026', 'Thứ 7', 'Trưa', 'Lacàph Tầng 1, 220 Nguyễn Công Trứ Q1', '480k', '120p'],
  ['03/10/2026', 'Thứ 7', '', 'Workshop làm gốm – 100 Trần Quốc Toản, Quận 3', '400k', '3h trải nghiệm'],
  ['03/10/2026', 'Thứ 7', '16:00', 'Quận 7', '30', ''],
  ['04/10/2026', 'Chủ nhật', '12:00', 'Chưa chốt', '', ''],
  ['05/10/2026', 'Thứ 2', '', 'Làm thủy tinh – 34/7 Đinh Thị Thi, Hiệp Bình', '700k', ''],
  ['06/10/2026', 'Thứ 3', '', '', '', ''],
  ['07/10/2026', 'Thứ 4', '09:00', 'Làm Terarium – 443/6 Đ. Lê Văn Sỹ, Nhiêu Lộc', '320k', '2-3 tiếng'],
  ['07/10/2026', 'Thứ 4', '', 'Quay nhà Genesis – KDC Đào Sư Tích, Nhà Bè', '', ''],
  ['08/10/2026', 'Thứ 5', '08:00', 'Đánh golf – Partee, 12 Nguyễn Hữu Thọ, Nhà Bè', '200k', '60p'],
  ['08/10/2026', 'Thứ 5', '', 'Workshop làm gốm – 26 Lý Tự Trọng, SG', '700k', '3 tiếng'],
  ['08/10/2026', 'Thứ 5', '09:00', 'Tennis – sân Tấn Trường, Quận 7', '30', ''],
  ['09/10/2026', 'Thứ 6', '', '', '', ''],
  ['10/10/2026', 'Thứ 7', '09:00', 'Boxing – 273 Huỳnh Văn Bánh, Phú Nhuận', '106', ''],
  ['11/10/2026', 'CN', '', '', '', '']
];

var CU_DANG = [
  ['06/10/2026', 'Thứ 3', '19:00', 'Kingdom Quận 10', 'Nhà', 'king dom quận 10'],
  ['07/10/2026', 'Thứ 4', '10:00', 'Trống drum', 'Trải nghiệm', 'Reel / Short'],
  ['08/10/2026', 'Thứ 5', '19:00', 'Aurora 2PN', 'Nhà', 'aurora 2pn'],
  ['11/10/2026', 'Chủ nhật', '10:00', 'Leo núi', 'Trải nghiệm', 'Reel / Vlog'],
  ['11/10/2026', 'Chủ nhật', '10:00', 'The Privé 1PN', 'Nhà', 'the privé 1pn']
];

var CU_CLIP = [
  ['Trống drum', 'Trải nghiệm', 'Tồn kho'],
  ['Workshop bắn thảm', 'Trải nghiệm', 'Tồn kho'],
  ['Leo núi', 'Trải nghiệm', 'Tồn kho'],
  ['Workshop làm bạc', 'Trải nghiệm', 'Tồn kho'],
  ['The Privé 1PN', 'Nhà', 'Tồn kho'],
  ['Kingdom review', 'Nhà', 'Tồn kho'],
  ['Q7 Riversite review', 'Nhà', 'Tồn kho']
];

function taoLichSuCu(ss) {
  var sh = laySheet(ss, NHAN.LS_CU);
  sh.clear();
  donDep(sh);

  sh.getRange('A1').setValue('LỊCH SỬ CŨ (29/09 – 11/10/2026)')
    .setFontWeight('bold').setFontColor('#8B5E00');

  sh.getRange('A3').setValue('LỊCH QUAY CŨ').setFontWeight('bold').setBackground('#C6E0B4');
  sh.getRange('A4:F4').setValues([['Ngày', 'Thứ', 'Giờ', 'Nội dung / Địa điểm', 'Chi phí', 'Thời lượng']]);
  sh.getRange('A4:F4').setFontWeight('bold');
  sh.getRange(5, 1, CU_QUAY.length, 6).setValues(CU_QUAY);
  sh.setColumnWidth(4, 380);

  var dong = 5 + CU_QUAY.length + 1;
  sh.getRange(dong, 1).setValue('LỊCH ĐĂNG CŨ').setFontWeight('bold').setBackground('#F8CBAD');
  dong++;
  sh.getRange(dong, 1, 1, 6).setValues([['Ngày', 'Thứ', 'Giờ đăng', 'Tên clip', 'Loại', 'Ghi chú']]);
  sh.getRange(dong, 1, 1, 6).setFontWeight('bold');
  dong++;
  sh.getRange(dong, 1, CU_DANG.length, 6).setValues(CU_DANG);

  dong += CU_DANG.length + 1;
  sh.getRange(dong, 1).setValue('CLIP TỒN KHO').setFontWeight('bold').setBackground('#BDD7EE');
  dong++;
  sh.getRange(dong, 1, 1, 3).setValues([['Tên clip', 'Loại', 'Tình trạng']]);
  sh.getRange(dong, 1, 1, 3).setFontWeight('bold');
  dong++;
  sh.getRange(dong, 1, CU_CLIP.length, 3).setValues(CU_CLIP);

  // Đưa clip tồn kho sang tab Kho clip
  var kho = ss.getSheetByName(NHAN.KHO_CLIP);
  if (kho && kho.getLastRow() < 2) {
    var them = CU_CLIP.map(function (c, i) {
      return [
        i + 1, c[0],
        c[1] === 'Nhà' ? 'Linh Địa Ốc Sài Gòn' : 'Koko Linh',
        c[1], '', 'Mang từ file kế hoạch cũ', c[2], '', '', ''
      ];
    });
    kho.getRange(2, 1, them.length, 10).setValues(them);
  }
  return sh;
}

/* =====================================================================
 *  PHẦN 9 — SINH TUẦN MỚI
 * ===================================================================== */

function sinhTuanMoi() {
  var ss = laySS();
  var hienThi = SpreadsheetApp.getUi().prompt(
    'Sinh tuần mới',
    'Nhập ngày thứ Hai của tuần (dd/mm/yyyy), ví dụ 19/10/2026.\nĐể trống = tuần kế tiếp so với dòng cuối cùng.',
    ui.ButtonSet.OK_CANCEL);

  if (hienThi.getSelectedButton() !== ui.Button.OK) return;
  var nhap = String(hienThi.getResponseText()).trim();

  var thuHai;
  if (!nhap) {
    thuHai = thuHaiTrongTuan(new Date());
    // lấy tuần lớn nhất đang có trong Lịch đăng rồi + 7
    var ld = ss.getSheetByName(NHAN.LICH_DANG);
    var maxTuan = new Date();
    if (ld && ld.getLastRow() > 1) {
      var vals = ld.getRange(2, 2, ld.getLastRow() - 1, 1).getValues();
      vals.forEach(function (r) {
        if (r[0] instanceof Date && r[0] > maxTuan) maxTuan = r[0];
      });
    }
    thuHai = thuHaiTrongTuan(maxTuan);
    thuHai.setDate(thuHai.getDate() + 7);
  } else {
    var p = nhap.split('/');
    if (p.length !== 3) {
      SpreadsheetApp.getUi().alert('Sai định dạng. Ví dụ đúng: 19/10/2026');
      return;
    }
    thuHai = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
  }

  sinhTuanChoTuan(ss, thuHai);
  SpreadsheetApp.getUi().alert(
    'Đã sinh tuần ' + ngay(thuHai) +
    '\n\nMở tab "Lịch đăng" và "Lịch quay" để điền chi tiết.'
  );
}

function sinhTuanChoTuan(ss, thuHai, imLang) {
  var ld = ss.getSheetByName(NHAN.LICH_DANG);
  var lq = ss.getSheetByName(NHAN.LICH_QUAY);
  if (!ld || !lq) throw new Error('Thiếu tab Lịch đăng hoặc Lịch quay. Hãy chạy taoHeThong() trước.');

  var kenhTN = giaTri(ss, CF.kenhTN) || 'Koko Linh';
  var kenhNHA = giaTri(ss, CF.kenhNHA) || 'Linh Địa Ốc Sài Gòn';
  var soClipTN = Number(giaTri(ss, CF.soClipTN)) || 2;
  var soClipNHA = Number(giaTri(ss, CF.soClipNHA)) || 3;
  var soQuayTN = Number(giaTri(ss, CF.soQuayTN)) || 3;
  var soQuayNHA = Number(giaTri(ss, CF.soQuayNHA)) || 4;
  var gioTN = giaTri(ss, CF.gioTN) || '10:00';
  var gioNHA = giaTri(ss, CF.gioNHA) || '20:00';

  // Không sinh trùng tuần
  var daCo = ld.getRange(2, 2, Math.max(1, ld.getLastRow() - 1), 1).getValues()
    .some(function (r) {
      if (!(r[0] instanceof Date)) return false;
      var d = new Date(r[0]);
      return d.getFullYear() === thuHai.getFullYear() &&
        d.getMonth() === thuHai.getMonth() && d.getDate() === thuHai.getDate();
    });
  if (daCo) {
    if (!imLang) {
      SpreadsheetApp.getUi().alert('Tuần ' + ngay(thuHai) + ' đã có trong Lịch đăng. Không sinh trùng.');
    }
    return;
  }

  // --- Lịch đăng: 2 trải nghiệm + 3 nhà, rải đều trong tuần ---
  var mau = [];
  var i, offset;
  for (i = 0; i < soClipTN; i++) {
    offset = [1, 5][i % 2];
    var dTN = new Date(thuHai.getTime());
    dTN.setDate(dTN.getDate() + offset);
    mau.push([dTN, kenhTN, 'Trải nghiệm', dTN, gioTN, 'Trải nghiệm / Lifestyle', 'Reel / Short']);
  }
  for (i = 0; i < soClipNHA; i++) {
    offset = [2, 4, 6][i % 3];
    var dNHA = new Date(thuHai.getTime());
    dNHA.setDate(dNHA.getDate() + offset);
    mau.push([dNHA, kenhNHA, 'Nhà', dNHA, gioNHA, 'BĐS / Review nhà', 'Reel / Short']);
  }

  var dongDau = ld.getLastRow() + 1;
  var rows = mau.map(function (m, i) {
    return [dongDau + i, thuHai, m[1], m[2], m[3], '', m[4], '', m[5], m[6],
      'Chưa viết', '', '', 'Chưa quay', '', '', 'Chưa dựng', '',
      'Chưa duyệt', '', 'Chưa đăng', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  });
  ld.getRange(dongDau, 1, rows.length, C_DANG.length).setValues(rows);
  ld.getRange(dongDau, 5, rows.length, 1).setNumberFormat('dd/MM/yyyy');
  ld.getRange(dongDau, 2, rows.length, 1).setNumberFormat('dd/MM/yyyy');
  ld.getRange(dongDau, 1, rows.length, C_DANG.length).setBackground('#FFFDF0');

  // --- Lịch quay: 3 trải nghiệm + 4 nhà, đặt trước hạn của clip ---
  var qMau = [];
  var buoi = 0;
  while (qMau.length < soQuayTN + soQuayNHA) {
    var laTN = buoi < soQuayTN;
    var offsetQ = [1, 2, 3, 4][buoi % 4];
    var dQ = new Date(thuHai.getTime());
    dQ.setDate(dQ.getDate() + offsetQ);
    qMau.push([
      thuHai, laTN ? kenhTN : kenhNHA, laTN ? 'Trải nghiệm' : 'Nhà',
      dQ, laTN ? gioTN : gioNHA, '', '', '', '',
      laTN ? soClipTN : soClipNHA, 'Chưa chốt'
    ]);
    buoi++;
    if (buoi > 20) break;
  }

  var dongQ = lq.getLastRow() + 1;
  // 18 cot khop voi C_QUAY: ID, Tuần, Kênh, Loại, Ngày, Thứ, Giờ,
  // Nội dung, Địa điểm, Thời lượng, Chi phí, Người hẹn, Người quay,
  // Trạng thái, Ngày xong, Link tư liệu, Số clip, Cảnh báo
  var rowsQ = qMau.map(function (m, i) {
    return [dongQ + i, m[0], m[1], m[2], m[3], '', m[4], m[5], m[6], m[7],
      '', '', '', m[8], '', '', m[9], ''];
  });
  lq.getRange(dongQ, 1, rowsQ.length, C_QUAY.length).setValues(rowsQ);
  lq.getRange(dongQ, 5, rowsQ.length, 1).setNumberFormat('dd/MM/yyyy');
  lq.getRange(dongQ, 2, rowsQ.length, 1).setNumberFormat('dd/MM/yyyy');
  lq.getRange(dongQ, 1, rowsQ.length, C_QUAY.length).setBackground('#F1F8F4');
}

/* =====================================================================
 *  PHẦN 10 — HÀM CHÍNH
 * ===================================================================== */

function taoHeThong() {
  var ss = laySS();

  // Bỏ sheet thừa
  var gi = ss.getSheetByName('Sheet1');
  var ds = ss.getSheets();
  for (var i = ds.length - 1; i >= 0; i--) {
    if (ds[i].getName() === 'Sheet1' || ds[i].getName() === 'Trang tính1') {
      if (ds.length > 1) ss.deleteSheet(ds[i]);
      else ds[i].setName('Ghi chú');
    }
  }

  taoCauHinh(ss);
  taoLichDang(ss);
  taoLichQuay(ss);
  taoKhoClip(ss);
  taoLichSuCu(ss);
  taoDashboard(ss);

  // Xếp tab
  var thuTu = [NHAN.DASHBOARD, NHAN.LICH_DANG, NHAN.LICH_QUAY,
    NHAN.KHO_CLIP, NHAN.CAU_HINH, NHAN.LS_CU];
  var viTri = {};
  thuTu.forEach(function (n, i) { viTri[n] = i + 1; });
  Object.keys(viTri).forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh && sh.getIndex() !== viTri[n] - 1) {
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(viTri[n]);
    }
  });

  // Sinh sẵn tuần hiện tại (im lặng, không hiện popup)
  try { sinhTuanChoTuan(ss, thuHaiTrongTuan(new Date()), true); } catch (e) {
    console.warn('Sinh tuần hien tai bi bo qua: ' + e.message);
  }

  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ HỆ THỐNG NỘI DUNG')
    .addItem('➕ Sinh tuần mới', 'sinhTuanMoi')
    .addItem('🔄 Tính lại Dashboard', 'taoDashboardChayLai')
    .addItem('📋 Đọc danh sách tuần', 'xemDanhSachTuan')
    .addSeparator()
    .addItem('♻️ Tạo lại toàn bộ hệ thống', 'taoHeThong')
    .addToUi();

  ui.alert('✅ Đã tạo xong hệ thống.',
    '6 tab mới: Dashboard, Lịch đăng, Lịch quay, Kho clip, Cấu hình, Lịch sử cũ.\n\n' +
    'Bước tiên: mở tab "Cấu hình" cột E, ghi tên nhân sự (mỗi người 1 dòng).\n' +
    'Sau đó dùng menu "⚙️ HỆ THỐNG NỘI DUNG" để sinh tuần mới.');
}

function taoDashboardChayLai() {
  var ss = laySS();
  taoDashboard(ss);
  SpreadsheetApp.getUi().alert('Đã tính lại Dashboard.');
}

function xemDanhSachTuan() {
  var ss = laySS();
  var ld = ss.getSheetByName(NHAN.LICH_DANG);
  var last = ld.getLastRow();
  if (last < 2) { SpreadsheetApp.getUi().alert('Chưa có tuần nào.'); return; }
  var vals = ld.getRange(2, 2, last - 1, 1).getValues();
  var ds = {};
  vals.forEach(function (r) {
    if (r[0] instanceof Date) ds[ngay(r[0])] = 1;
  });
  SpreadsheetApp.getUi().alert('Các tuần đang có trong Lịch đăng:',
    Object.keys(ds).join('\n') || '(chưa có)');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ HỆ THỐNG NỘI DUNG')
    .addItem('➕ Sinh tuần mới', 'sinhTuanMoi')
    .addItem('🔄 Tính lại Dashboard', 'taoDashboardChayLai')
    .addItem('📋 Đọc danh sách tuần', 'xemDanhSachTuan')
    .addSeparator()
    .addItem('♻️ Tạo lại toàn bộ hệ thống', 'taoHeThong')
    .addToUi();
}