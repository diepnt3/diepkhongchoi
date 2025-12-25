# Hướng dẫn đóng gói và phân phối ứng dụng Next.js

## Cách đóng gói ứng dụng

### Phương pháp 1: Sử dụng script PowerShell (Khuyến nghị)

Chạy script sau trong PowerShell:

```powershell
.\package-for-distribution.ps1
```

Script sẽ tự động:
- **Kiểm tra BUILD_ID** - Đảm bảo đây là production build (không phải development build)
- **Tự động build** - Nếu chưa có production build, script sẽ hỏi và tự động build
- Copy tất cả file cần thiết (`.next`, `public`, `src`, config files)
- Loại bỏ `node_modules` (người nhận sẽ tự cài)
- Tạo file ZIP sẵn sàng để gửi

**Lưu ý:** Script sẽ kiểm tra file `.next/BUILD_ID` để xác nhận đây là production build. Nếu không có, bạn sẽ được hỏi có muốn build ngay không.

### Phương pháp 2: Đóng gói thủ công

Tạo một thư mục mới và copy các file/thư mục sau:

**Bắt buộc:**
- `.next/` - Build output (đã build sẵn)
- `public/` - Static assets
- `src/` - Source code (cần thiết cho production)
- `package.json` - Dependencies
- `yarn.lock` hoặc `package-lock.json` - Lock file

**File cấu hình:**
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `next-env.d.ts`

**KHÔNG copy:**
- `node_modules/` - Quá lớn, người nhận sẽ tự cài
- `.git/` - Không cần thiết
- `.next/cache/` - Có thể loại bỏ để giảm kích thước

Sau đó nén thành file ZIP.

## Hướng dẫn cho người nhận

Sau khi nhận được file ZIP, người nhận cần:

1. **Giải nén file ZIP**

2. **Cài đặt dependencies:**
   ```bash
   yarn install
   ```
   hoặc
   ```bash
   npm install
   ```

3. **Chạy production server:**
   ```bash
   yarn start
   ```
   hoặc
   ```bash
   npm start
   ```

4. **Truy cập ứng dụng:**
   Mở trình duyệt: http://localhost:3000

## Lưu ý quan trọng

### Về Production Build
- ✅ **BUILD_ID là bắt buộc** - File `.next/BUILD_ID` phải tồn tại để `yarn start` hoạt động
- ✅ Production build chỉ được tạo bằng `yarn build`, không phải `yarn dev`
- ✅ Script sẽ tự động kiểm tra và cảnh báo nếu thiếu BUILD_ID

### Cho người gửi
- ✅ Luôn chạy `yarn build` trước khi đóng gói (hoặc để script tự động build)
- ✅ Kiểm tra file `.next/BUILD_ID` tồn tại trước khi đóng gói
- ✅ Không đóng gói thư mục `.next` từ development mode (`yarn dev`)

### Cho người nhận
- ✅ Ứng dụng đã được build sẵn, không cần chạy `yarn build` lại
- ✅ Người nhận chỉ cần cài `node_modules` và chạy `yarn start`
- ✅ Nếu muốn build lại từ đầu, có thể chạy `yarn build`
- ⚠️ Đảm bảo Node.js version tương thích (18.x trở lên)
- ⚠️ Nếu có biến môi trường (`.env`), nhớ gửi kèm file `.env.example` hoặc hướng dẫn cấu hình

