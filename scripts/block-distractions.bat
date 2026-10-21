@echo off
:: ========================================================
:: System for Mikiyas - Windows System-Level App Blocker
:: Blocks Instagram, TikTok, Chess.com, YouTube, Facebook
:: ========================================================

echo Checking for administrator privileges...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges to modify system hosts.
    echo Please right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

set HOSTS=%WINDIR%\System32\drivers\etc\hosts
set BACKUP=%WINDIR%\System32\drivers\etc\hosts.mikiyas_backup

echo Backing up hosts file to %BACKUP%...
if not exist "%BACKUP%" copy "%HOSTS%" "%BACKUP%" >nul

echo Applying permanent distraction blocks...
echo. >> "%HOSTS%"
echo # === SYSTEM FOR MIKIYAS BLOCK LIST === >> "%HOSTS%"
echo 127.0.0.1 instagram.com >> "%HOSTS%"
echo 127.0.0.1 www.instagram.com >> "%HOSTS%"
echo 127.0.0.1 api.instagram.com >> "%HOSTS%"
echo 127.0.0.1 threads.net >> "%HOSTS%"
echo 127.0.0.1 www.threads.net >> "%HOSTS%"
echo 127.0.0.1 tiktok.com >> "%HOSTS%"
echo 127.0.0.1 www.tiktok.com >> "%HOSTS%"
echo 127.0.0.1 m.tiktok.com >> "%HOSTS%"
echo 127.0.0.1 chess.com >> "%HOSTS%"
echo 127.0.0.1 www.chess.com >> "%HOSTS%"
echo 127.0.0.1 facebook.com >> "%HOSTS%"
echo 127.0.0.1 www.facebook.com >> "%HOSTS%"
echo 127.0.0.1 m.facebook.com >> "%HOSTS%"
echo # === END SYSTEM FOR MIKIYAS === >> "%HOSTS%"

echo Flushing DNS cache...
ipconfig /flushdns >nul

echo.
echo ========================================================
echo [SUCCESS] Permanent App Blocking is now ACTIVE system-wide!
echo All browsers (Chrome, Edge, Brave, Firefox) and apps 
echo are now blocked from accessing Instagram, TikTok, and Chess.com.
echo To unblock in the future, run: unblock-distractions.bat
echo ========================================================
echo.
pause
