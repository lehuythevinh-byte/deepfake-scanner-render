@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Deepfake Scanner V5.0.1 - Push GitHub
cd /d "%~dp0"

echo ============================================================
echo   DEEPFAKE SCANNER V5.0.1 - GITHUB PUSH
echo ============================================================
echo.
echo Cua so nay se GIU MO sau khi hoan tat hoac gap loi.
echo Khong dong cua so trong khi Git dang clone / commit / push.
echo.

if not exist "%~dp0PUSH_TO_GITHUB.ps1" (
  echo [LOI] Khong tim thay PUSH_TO_GITHUB.ps1.
  echo Hay giai nen day du ZIP truoc khi chay.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0PUSH_TO_GITHUB.ps1"
set "RESULT=%ERRORLEVEL%"

echo.
if "%RESULT%"=="0" (
  echo [DA KET THUC] Kiem tra thong bao phia tren de biet da PUSH hay da HUY.
) else (
  echo [CO LOI] Ma loi: %RESULT%
  echo Hay chup man hinh hoac gui file PUSH_TO_GITHUB_LOG.txt de duoc sua tiep.
)
echo.
echo Nhan phim bat ky de dong cua so nay.
pause >nul
exit /b %RESULT%
