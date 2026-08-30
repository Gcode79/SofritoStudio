#Requires -RunAsAdministrator
# ============================================================
#  ASUS TUF A15 (FA506IV) System Tune-Up
#  Run ONCE from an elevated PowerShell (right-click > Run as admin)
#  Keeps a log on your Desktop: System-TuneUp-Log.txt
# ============================================================

$ErrorActionPreference = 'Continue'
$log = Join-Path $env:USERPROFILE 'Desktop\System-TuneUp-Log.txt'
try { Start-Transcript -Path $log -Force | Out-Null } catch {}

Write-Host "`n===== SYSTEM TUNE-UP START $(Get-Date) =====" -ForegroundColor Green

# ---- 1. Enable hibernation (also enables Fast Startup) ----
Write-Host "`n[1/5] Enabling hibernation..." -ForegroundColor Cyan
powercfg /h on
powercfg /a | Out-Null
Write-Host "      Done. Hibernation available: $((powercfg /a) -match 'Hibernate')"

# ---- 2. Reset the NVIDIA Virtual Audio Device (error 32) ----
Write-Host "`n[2/5] Fixing NVIDIA Virtual Audio Device..." -ForegroundColor Cyan
$dev = Get-PnpDevice -InstanceId 'ROOT\UNNAMED_DEVICE\0000' -ErrorAction SilentlyContinue
if ($dev) {
    $dev | Disable-PnpDevice -Confirm:$false -ErrorAction SilentlyContinue
    $dev | Enable-PnpDevice  -Confirm:$false -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    $check = Get-PnpDevice -InstanceId 'ROOT\UNNAMED_DEVICE\0000' -ErrorAction SilentlyContinue
    Write-Host "      Status now: $($check.Status) (Problem code: $($check.Problem))"
} else {
    Write-Host "      Device not found - nothing to do."
}

# ---- 3. System File Checker ----
Write-Host "`n[3/5] Running System File Checker (sfc /scannow)..." -ForegroundColor Cyan
Write-Host "      This can take 5-15 minutes. Please wait..."
sfc /scannow

# ---- 4. DISM image health restore ----
Write-Host "`n[4/5] Running DISM image repair (RestoreHealth)..." -ForegroundColor Cyan
Write-Host "      This can take 10-30 minutes. Please wait..."
DISM /Online /Cleanup-Image /RestoreHealth

# ---- 5. Install pending Windows Updates ----
Write-Host "`n[5/5] Installing pending Windows Updates..." -ForegroundColor Cyan
try {
    $session = New-Object -ComObject Microsoft.Update.Session
    $searcher = $session.CreateUpdateSearcher()
    $result = $searcher.Search('IsInstalled=0')
    if ($result.Updates.Count -eq 0) {
        Write-Host '      No pending updates found.'
    } else {
        Write-Host "      Found $($result.Updates.Count) update(s):"
        $result.Updates | ForEach-Object { Write-Host "        - $($_.Title)" }
        $downloader = $session.CreateUpdateDownloader()
        $downloader.Updates = $result.Updates
        $dl = $downloader.Download()
        Write-Host "      Download result: $($dl.ResultCode)"
        if ($dl.ResultCode -eq 2) {
            $installer = $session.CreateUpdateInstaller()
            $installer.Updates = $result.Updates
            $inst = $installer.Install()
            Write-Host "      Install result: $($inst.ResultCode) (2 = success, needs restart)"
        }
    }
} catch {
    Write-Host "      Windows Update step failed: $($_.Exception.Message)"
}

Write-Host "`n===== TUNE-UP FINISHED $(Get-Date) =====" -ForegroundColor Green
Write-Host "Log saved to: $log"
Write-Host "`nA restart is RECOMMENDED to finish updates and clean up."
