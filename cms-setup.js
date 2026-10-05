// Thêm menu vào Google Sheet
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Unite Group CMS')
    .addItem('Tạo Bảng Nội Dung Web (CMS)', 'setupCMS')
    .addItem('Tạo Bảng Lịch Training', 'setupTrainingSheet')
    .addToUi();
}

// Chạy hàm này để tạo bảng quản lý nội dung Web
function setupCMS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Web_Content');
  
  if (!sheet) {
    sheet = ss.insertSheet('Web_Content');
  } else {
    sheet.clear();
  }
  
  const headers = ['Trang (Page)', 'Mã vị trí (Key)', 'Nội dung hiển thị (Content)', 'Ghi chú / Hướng dẫn'];
  sheet.getRange(1, 1, 1, headers.length)
       .setValues([headers])
       .setFontWeight('bold')
       .setBackground('#111111')
       .setFontColor('#d4af37');
  
  const sampleData = [
    ['global', 'hotline', 'Hotline HR: 070 367 2595', 'Sửa số điện thoại ở cuối trang web'],
    ['tpa', 'hero_title', 'Chuyên viên tư vấn', 'Tiêu đề to nhất ở đầu trang TPA'],
    ['tpa', 'hero_subtitle', 'vị trí <span class="title-soft">TPA</span>', 'Tiêu đề màu vàng ở đầu trang TPA'],
    ['tpa', 'hero_lead', 'Gia nhập TPA – phát triển kỹ năng tìm nguồn nhà, khảo sát thực tế...', 'Đoạn văn giới thiệu đầu trang TPA'],
    ['nha-nguyen-can', 'hero_title', 'Chuyên viên tư vấn', 'Tiêu đề to nhất ở đầu trang Nhà nguyên căn'],
    ['index', 'hero_title', 'Chuyên viên tư vấn', 'Tiêu đề to nhất ở trang Căn hộ']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  sheet.setColumnWidth(1, 150); // Trang
  sheet.setColumnWidth(2, 150); // Key
  sheet.setColumnWidth(3, 500); // Content
  sheet.setColumnWidth(4, 250); // Note
  
  sheet.getRange(2, 3, 1000).setWrap(true);
  
  // Tạo dropdown chọn trang
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['global', 'index', 'nha-nguyen-can', 'tpa'], true)
    .build();
  sheet.getRange(2, 1, 1000).setDataValidation(rule);
  
  // Đóng băng hàng đầu tiên
  sheet.setFrozenRows(1);
  
  SpreadsheetApp.getUi().alert('Đã tạo thành công Bảng Web_Content!\n\nBây giờ bạn có thể gõ nội dung vào cột C, web sẽ tự động cập nhật!');
}
