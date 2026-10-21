@echo off
:: ========================================================
:: System for Mikiyas - Windows App Unblocker
:: ========================================================

echo Checking for administrator privileges...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as administrator".
    pause
    exit /b 1
)

set HOSTS=%WINDIR%\System32\drivers\etc\hosts
set BACKUP=%WINDIR%\System32\drivers\etc\hosts.mikiyas_backup

if exist "%BACKUP%" (
    echo Restoring original hosts file from %BACKUP%...
    copy /y "%BACKUP%" "%HOSTS%" >nul
    echo Flushing DNS cache...
    ipconfig /flushdns >nul
    echo.
    echo [SUCCESS] Original hosts file restored! Apps are unblocked.
) else (
    echo Removing Mikiyas block entries from %HOSTS%...
    powershell -Command "$content = Get-Content '%HOSTS%' | Where-Object { $_ -notmatch 'SYSTEM FOR MIKIYAS|127.0.0.1 (instagram|tiktok|chess|facebook|threads)' }; Set-Content '%HOSTS%' -Value $content"
    ipconfig /flushdns >nul
    echo.
    echo [SUCCESS] Block entries removed!
)

echo.
pause
