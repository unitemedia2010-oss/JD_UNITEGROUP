# Vì sao ảnh trong thư mục img không hiện trên web?

Nguyên nhân chính trong repo của Hạnh là tên file ảnh trên GitHub đang là:

- `img/01.JPG`
- `img/02.JPG`
- `img/03.JPG`
- `img/04.JPG`

Nhưng code web thường gọi:

- `img/01.jpg`
- `img/02.jpg`
- `img/03.jpg`
- `img/04.jpg`

GitHub Pages phân biệt chữ hoa/thường, nên `.JPG` và `.jpg` là 2 tên khác nhau.

## Bản này đã sửa

Trong `data/config.js`, đường dẫn ảnh đã đổi thành:

```js
image: "img/01.JPG"
image: "img/02.JPG"
image: "img/03.JPG"
image: "img/04.JPG"
```

## Nếu muốn dùng tên chuẩn hơn

Có thể đổi tên file trên GitHub thành chữ thường:

- `01.jpg`
- `02.jpg`
- `03.jpg`
- `04.jpg`

Sau đó sửa lại `data/config.js` thành `.jpg`.

## Lưu ý khi đổi tên trên Windows

Nếu chỉ đổi `01.JPG` thành `01.jpg`, Git đôi khi không nhận thay đổi vì chỉ khác chữ hoa/thường. Cách chắc chắn:

1. Đổi `01.JPG` thành `01-temp.jpg`
2. Commit
3. Đổi `01-temp.jpg` thành `01.jpg`
4. Commit lần nữa
