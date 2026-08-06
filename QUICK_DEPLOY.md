# 🚀 Quick Deploy Guide - Science Lab Hackathon Game

## Tổng quan

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │◄────────┤    Backend      │
│   (Netlify)     │         │   (Render)      │
│                 │         │                 │
│  React + Vite   │    API  │   Go Server     │
│  Port: 443      │◄───────►│   Port: 8080    │
│  Free forever   │         │   Free tier     │
└─────────────────┘         └─────────────────┘
```

---

## 📋 Checklist Deploy

### ✅ Backend (Render.com)

| Step | Action | Status |
|------|--------|--------|
| 1 | Push code lên GitHub | ☐ |
| 2 | Đăng ký Render.com | ☐ |
| 3 | New → Blueprint (hoặc Web Service) | ☐ |
| 4 | Chọn repo & branch `main` | ☐ |
| 5 | Chờ build (~5-10 phút) | ☐ |
| 6 | Copy URL: `https://xxxx.onrender.com` | ☐ |

### ✅ Frontend (Netlify)

| Step | Action | Status |
|------|--------|--------|
| 1 | `cd frontend && npm install && npm run build` | ☐ |
| 2 | Drag `dist/` folder lên Netlify | ☐ |
| 3 | Add Environment Variable: `VITE_API_BASE_URL` | ☐ |
| 4 | Trigger re-deploy | ☐ |
| 5 | Copy URL: `https://xxxx.netlify.app` | ☐ |
| 6 | Update Backend `ALLOWED_ORIGINS` | ☐ |

---

## 🔗 Link quan trọng

- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
- **Repo GitHub**: [Link của bạn]

---

## ⚙️ Environment Variables

### Backend (Render)
```bash
PORT=8080
DB_PATH=/opt/render/project/backend/data/hackathon-game.db
ALLOWED_ORIGINS=https://YOUR_NETLIFY_SITE.netlify.app,http://localhost:5173
ENVIRONMENT=production
```

### Frontend (Netlify)
```bash
VITE_API_BASE_URL=https://YOUR_BACKEND.onrender.com
```

---

## 🧪 Test kết nối

Sau khi deploy xong:

1. **Test Backend Health**:
   ```bash
   curl https://YOUR_BACKEND.onrender.com/game/status
   ```

2. **Test Frontend**:
   - Mở `https://YOUR_NETLIFY_SITE.netlify.app`
   - Đăng nhập với host: code `host2026`

3. **Test WebSocket**:
   - Host login → Click "Start Game"
   - Player login → Kiểm tra scoreboard real-time

---

## 📝 Tham khảo

- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Hướng dẫn chi tiết Backend
- [frontend/NETLIFY_DEPLOY.md](./frontend/NETLIFY_DEPLOY.md) - Hướng dẫn chi tiết Frontend

---

## ❓ FAQ

### Q: Backend mất data khi Render restart?
A: Đảm bảo đã cấu hình **Persistent Disk** trong Render:
- Name: `data`
- Mount Path: `/opt/render/project/backend/data`

### Q: Frontend không kết nối được Backend?
A: Kiểm tra:
1. `VITE_API_BASE_URL` đúng chưa?
2. Backend `ALLOWED_ORIGINS` có URL frontend chưa?
3. Backend đã deploy xong chưa?

### Q: Free tier có đủ dùng không?
A:
- **Render Free**: 512MB RAM, 0.1 CPU - đủ cho game hackathon nhỏ
- **Netlify Free**: Unlimited bandwidth, 100GB build minutes/month

---

## 🎉 Hoàn tất!

Game của bạn đã live online:
- 🎮 Players: `https://YOUR_NETLIFY_SITE.netlify.app`
- 📊 API: `https://YOUR_BACKEND.onrender.com`
- 🔧 Host Dashboard: Truy cập với code `host2026`
