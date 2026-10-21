import { BlockedApp } from '../types';

/**
 * Windows Hosts Blocker Generator
 * Generates a native Windows batch (.bat) script to block distraction apps
 * across all browsers (Chrome, Edge, Brave, etc.) and desktop applications at the OS network level.
 */
export function generateWindowsBlockerBat(apps: BlockedApp[]): string {
  // Collect all domains for blocked apps
  const domainsToBlock: string[] = [];
  apps
    .filter(a => a.isBlocked)
    .forEach(a => {
      if (a.domains && a.domains.length > 0) {
        domainsToBlock.push(...a.domains);
      }
    });

  const uniqueDomains = Array.from(new Set(domainsToBlock));

  const lines = [
    '@echo off',
    ':: ========================================================',
    ':: System for Mikiyas - Windows System-Level App Blocker',
    ':: Generated automatically for ADHD Focus Protection',
    ':: ========================================================',
    '',
    'echo Checking for administrator privileges...',
    'net session >nul 2>&1',
    'if %errorlevel% neq 0 (',
    '    echo [ERROR] This script requires Administrator privileges.',
    '    echo Please right-click this file and select "Run as administrator".',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'set HOSTS=%WINDIR%\\System32\\drivers\\etc\\hosts',
    'set BACKUP=%WINDIR%\\System32\\drivers\\etc\\hosts.mikiyas_backup',
    '',
    'echo Backing up hosts file to %BACKUP%...',
    'if not exist "%BACKUP%" copy "%HOSTS%" "%BACKUP%" >nul',
    '',
    'echo Applying permanent distraction blocks...',
    'echo.',
    'echo # === SYSTEM FOR MIKIYAS BLOCK LIST === >> "%HOSTS%"',
  ];

  uniqueDomains.forEach(domain => {
    lines.push(`echo 127.0.0.1 ${domain} >> "%HOSTS%"`);
    lines.push(`echo 127.0.0.1 www.${domain.replace(/^www\./, '')} >> "%HOSTS%"`);
  });

  lines.push('echo # === END SYSTEM FOR MIKIYAS === >> "%HOSTS%"');
  lines.push('');
  lines.push('echo Flushing DNS cache to enforce immediate block...');
  lines.push('ipconfig /flushdns >nul');
  lines.push('');
  lines.push('echo.');
  lines.push('echo ========================================================');
  lines.push('echo [SUCCESS] Permanent App Blocking is now ACTIVE system-wide!');
  lines.push('echo Blocked domains:');
  uniqueDomains.forEach(d => lines.push(`echo   - ${d}`));
  lines.push('echo All browsers and desktop applications are now blocked.');
  lines.push('echo To unblock later, run unblock-apps.bat.');
  lines.push('echo ========================================================');
  lines.push('echo.');
  lines.push('pause');

  return lines.join('\r\n');
}

/**
 * Generates the companion Windows unblocker script
 */
export function generateWindowsUnblockerBat(): string {
  const lines = [
    '@echo off',
    ':: ========================================================',
    ':: System for Mikiyas - Windows App Unblocker',
    ':: ========================================================',
    '',
    'net session >nul 2>&1',
    'if %errorlevel% neq 0 (',
    '    echo [ERROR] Please right-click and select "Run as administrator".',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'set HOSTS=%WINDIR%\\System32\\drivers\\etc\\hosts',
    'set BACKUP=%WINDIR%\\System32\\drivers\\etc\\hosts.mikiyas_backup',
    '',
    'if exist "%BACKUP%" (',
    '    echo Restoring original hosts file from %BACKUP%...',
    '    copy /y "%BACKUP%" "%HOSTS%" >nul',
    '    echo Flushing DNS...',
    '    ipconfig /flushdns >nul',
    '    echo [SUCCESS] Apps are unblocked successfully.',
    ') else (',
    '    echo Removing Mikiyas block entries from %HOSTS%...',
    '    powershell -Command "(Get-Content \'%HOSTS%\') -notmatch \'SYSTEM FOR MIKIYAS|127.0.0.1 (instagram|tiktok|chess|facebook|youtube)\' | Set-Content \'%HOSTS%\'"',
    '    ipconfig /flushdns >nul',
    '    echo [SUCCESS] Block list removed.',
    ')',
    '',
    'pause',
  ];

  return lines.join('\r\n');
}

/**
 * Triggers browser file download for the generated batch script
 */
export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
