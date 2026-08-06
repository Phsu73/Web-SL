@echo off
title He Thong Dieu Hanh Hackathon Game - Tu Dong Khoi Chay
cls
color 0A

echo ====================================================================
echo      HE THONG TU DONG KHOI CHAY TRONG GOI HACKATHON GAME
echo ====================================================================
echo.

:: 1. KHỞI CHẠY BACKEND GO (ĐÃ ĐƯỢC NÂNG CẤP TỰ TẢI THƯ VIỆN)
echo [1/3] Dang kiem tra va khoi chay Server Backend (Go)...
:: Lệnh được bọc lại để tự động "go mod tidy" trước, tránh việc thiếu websocket hay thư viện khác làm sập server
start "Backend Server (Go)" cmd /k "cd /d "%~dp0backend" && echo [He thong] Dang kiem tra dependencies... && go mod tidy && echo [He thong] Dang bat Server... && go run ."

:: Chờ 4 giây (tăng thêm 1 giây đề phòng máy BTC tự động tải websocket lần đầu)
timeout /t 4 >nul
echo.

:: 2. KHỞI CHẠY FRONTEND NODE.JS
echo [2/3] Dang khoi chay Server Frontend (Vite/Node.js)...
start "Frontend Server (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Chờ 3 giây để Frontend nạp các component giao diện lên cổng 5174
timeout /t 3 >nul
echo.

:: 3. TỰ ĐỘNG MỞ TRÌNH DUYỆT WEB
echo [3/3] Dang mo trinh duyet truy cap vao giao dien thi dau...
set "URL=http://localhost:5174"

:: Kiểm tra và ưu tiên mở bằng Google Chrome bản 64-bit hoặc 32-bit
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%URL%"
    goto end
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%URL%"
    goto end
)

:: Kiểm tra và mở bằng Microsoft Edge nếu máy không cài Chrome
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "%URL%"
    goto end
)

:: Nếu không thấy các trình duyệt trên, hệ thống dùng trình duyệt mặc định của Windows
start %URL%

:end
echo.
echo ====================================================================
echo    KHOI CHAY HOAN TAT! Vui long khong tat cac cua so CMD vua hien len.
echo ====================================================================
timeout /t 3 >nul
exit