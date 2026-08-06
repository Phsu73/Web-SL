# Hướng dẫn Deploy Frontend lên Netlify

## Bước 1: Build Frontend (Local)

```bash
cd frontend
npm install
npm run build
```

Thư mục `dist/` sẽ được tạo ra.

---

## Bước 2: Deploy lên Netlify

### Cách 1: Drag & Drop (Nhanh nhất)

1. Truy cập https://netlify.com
2. Đăng ký / Đăng nhập
3. Trong dashboard, kéo thư mục `frontend/dist/` vào **"Drag and drop your site output folder here"**
4. Đợi deploy hoàn tất (~1 phút)

### Cách 2: GitHub Connect (Khuyến nghị cho production)

1. Push code lên GitHub
2. Trên Netlify → **"Add new site"** → **"Import an existing project"**
3. Chọn GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Base directory**: `frontend`
5. Click **"Deploy site"**

---

## Bước 3: Cấu hình Environment Variables

### Trong Netlify Dashboard:

1. Vào **Site settings** → **Environment variables**
2. Thêm variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://YOUR_BACKEND.onrender.com` |

**Lưu ý**: Thay `YOUR_BACKEND.onrender.com` bằng URL backend từ Render.

---

## Bước 4: Re-deploy sau khi thêm env var

1. Vào **Deploys** → **Trigger deploy** → **Deploy site**
2. Hoặc commit một thay đổi nhỏ vào GitHub để trigger auto-deploy

---

## Lấy Frontend URL

Sau khi deploy:
- URL Netlify: `https://xxxxxxxxx.netlify.app`
- URL này cần thêm vào `ALLOWED_ORIGINS` của Backend
