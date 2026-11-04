@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Deepfake Scanner V5.0.1 - Localhost

echo ============================================================
echo  DEEPFAKE SCANNER V5.0.1 - LOCALHOST STARTER
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Chua cai Node.js. Hay cai Node.js 22.12+ hoac 24 LTS, sau do mo lai Git Bash/CMD.
  goto :fail
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Khong tim thay npm. Hay cai lai Node.js kem npm.
  goto :fail
)

for /f "tokens=1,2 delims=." %%A in ('node -p "process.versions.node"') do (
  set NODE_MAJOR=%%A
  set NODE_MINOR=%%B
)
if %NODE_MAJOR% LSS 22 (
  echo [ERROR] Node.js hien tai qua cu. Can Node.js 22.12+ hoac 24 LTS.
  node -v
  goto :fail
)
if %NODE_MAJOR% EQU 22 if %NODE_MINOR% LSS 12 (
  echo [ERROR] Node.js 22 can phien ban 22.12 tro len.
  node -v
  goto :fail
)

echo [OK] Node.js:
node -v
echo [OK] npm:
npm -v

echo.
if not exist ".env" (
  echo [INFO] Tao .env tu .env.example...
  copy ".env.example" ".env" >nul
  if errorlevel 1 (
    echo [ERROR] Khong tao duoc .env.
    goto :fail
  )
  echo [ACTION] Mo file .env va dien API key / DATABASE_URL neu can.
  echo [ACTION] Co the chay lai START_LOCALHOST.bat sau khi cau hinh.
  start "" notepad.exe "%CD%\.env"
)

if not exist "node_modules\tsx\dist\cli.mjs" (
  echo.
  echo [INFO] Dang cai dependencies lan dau. Can ket noi Internet...
  call npm ci --include=dev --no-audit --no-fund
  if errorlevel 1 (
    echo [WARN] npm ci that bai. Thu phuong an npm install...
    call npm install --include=dev --no-audit --no-fund
    if errorlevel 1 (
      echo [ERROR] Cai dependencies that bai. Kiem tra Internet va npm log.
      goto :fail
    )
  )
)

echo.
echo ============================================================
echo  DANG KHOI DONG SERVER
necho  Dia chi: http://localhost:3000
echo  Health:  http://localhost:3000/api/health
echo ============================================================
echo Mo trinh duyet tai http://localhost:3000 sau khi thay dong
 echo "server is running" ben duoi.
echo Nhan Ctrl+C de dung server.
echo.
call npm run dev
set EXIT_CODE=%ERRORLEVEL%
echo.
echo Server da dung. Ma thoat: %EXIT_CODE%
pause
exit /b %EXIT_CODE%

:fail
echo.
echo Hay sua loi theo thong bao tren roi chay lai START_LOCALHOST.bat.
pause
exit /b 1
