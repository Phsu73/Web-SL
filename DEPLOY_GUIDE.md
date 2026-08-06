# Hướng dẫn Deploy Backend lên Render.com

## Cách 1: Dùng Blueprint (Khuyến nghị)

### Bước 1: Push code lên GitHub

```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Prepare for deployment"
git branch -M main
git remote add origin https://github.com/USERNAME/YOUR_REPO.git
git push -u origin main
```

### Bước 2: Deploy trên Render

1. Truy cập https://render.com
2. Đăng ký / Đăng nhập bằng GitHub
3. Click **"New +"** → **"Blueprint"**
4. Chọn repository của bạn
5. Render sẽ tự động phát hiện `render.yaml` và deploy
6. Chờ khoảng 5-10 phút để build hoàn tất

### Bước 3: Lấy Backend URL

Sau khi deploy thành công, URL sẽ là:
```
https://hackathon-backend.onrender.com
```
Hoặc custom URL nếu bạn đặt tên khác.

---

## Cách 2: Manual Deploy

### 1. Tạo Web Service trên Render

1. Đăng nhập Render.com → **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Configure:
   - **Name**: `hackathon-backend`
   - **Region**: Singapore (hoặc Oregon)
   - **Branch**: `main`
   - **Runtime**: Docker
   - **DockerfilePath**: `./backend/Dockerfile`
   - **Context**: `./backend`

### 2. Cấu hình Environment Variables

| Key | Value |
|-----|-------|
| `PORT` | `8080` |
| `DB_PATH` | `/opt/render/project/backend/data/hackathon-game.db` |
| `ALLOWED_ORIGINS` | `https://YOUR_NETLIFY_SITE.netlify.app,http://localhost:5173` |
| `ENVIRONMENT` | `production` |

### 3. Cấu hình Persistent Disk

- Đến tab **"Advanced"** → **"Add Disk"**
- **Name**: `data`
- **Mount Path**: `/opt/render/project/backend/data`
- **Size**: 1 GB

### 4. Deploy

Click **"Create Web Service"** và chờ build hoàn tất.

---

## Troubleshooting

### Lỗi "go.mod not found"
- Đảm bảo Dockerfile copy đúng: `COPY *.go ./` và `COPY go.mod go.sum ./`

### Database mất khi restart
- Đảm bảo đã cấu hình Persistent Disk ở bước 3

### CORS lỗi từ frontend
- Kiểm tra `ALLOWED_ORIGINS` có chứa URL frontend của bạn
- Format: `https://site.netlify.app` (không có slash cuối)

---

## Lấy Backend URL sau khi deploy

Sau khi deploy thành công:
1. Vào Dashboard của service trên Render
2. Copy URL từ phần **"URL"**
3. Format: `https://xxxxxxxxx.onrender.com`

URL này sẽ được dùng để cấu hình Frontend.
