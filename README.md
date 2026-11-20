# Chess.com PiP

Extension Chrome đưa bàn cờ [chess.com](https://www.chess.com) vào cửa sổ **Picture-in-Picture** luôn nổi trên cùng, để bạn vừa chơi vừa làm việc khác.

## Yêu cầu
- Chrome 116 trở lên (dùng Document Picture-in-Picture API).

## Cài đặt
1. Tải hoặc clone repo này.
2. Mở `chrome://extensions` và bật **Developer mode**.
3. Bấm **Load unpacked**, chọn thư mục repo.

## Cách dùng
1. Vào một ván cờ trên chess.com.
2. Bấm nút **♟ PiP** ở góc dưới phải trang.
3. Trong hộp thoại chia sẻ của Chrome, chọn **tab chess.com hiện tại** rồi bấm Share.
4. Bàn cờ hiện trong cửa sổ nổi. Click quân rồi click ô đích, hoặc kéo thả để đi quân.
5. Đóng cửa sổ PiP, bấm **↩ Thoát PiP** hoặc **Stop sharing** để dừng.

## Cách hoạt động
Bàn cờ thật ở lại tab chính. Extension chiếu hình tab bằng `getDisplayMedia`, cắt vùng bàn cờ vẽ lên canvas trong cửa sổ PiP, và chuyển các thao tác chuột trên canvas thành sự kiện trên bàn cờ thật.

## Lưu ý
- Giữ tab chess.com mở và đừng cuộn bàn cờ ra khỏi vùng nhìn thấy.
- Mỗi lần mở PiP, Chrome sẽ hỏi quyền chia sẻ tab (không thể bỏ qua vì lý do bảo mật).
- Chess.com có thể đổi cấu trúc trang. Nếu không tìm thấy bàn cờ, chỉnh selector trong `findBoard()` ở `content.js`.

## Giấy phép
MIT
