# Script dong goi ung dung Next.js de phan phoi
# Loai bo node_modules va cac file khong can thiet

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Kiem tra Production Build ===" -ForegroundColor Cyan

# Kiem tra BUILD_ID - bat buoc cho production build
$buildIdPath = ".\.next\BUILD_ID"
if (-not (Test-Path $buildIdPath)) {
    Write-Host "`n[WARNING] Khong tim thay BUILD_ID trong thu muc .next!" -ForegroundColor Yellow
    Write-Host "Day co the la development build, khong the dung cho production." -ForegroundColor Yellow
    Write-Host "`nBan co muon build production ngay bay gio? (Y/N)" -ForegroundColor Cyan
    
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y" -or $response -eq "yes") {
        Write-Host "`nDang build production..." -ForegroundColor Yellow
        yarn build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Build that bai! Vui long kiem tra loi va thu lai." -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Build thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Khong the dong goi ma khong co production build!" -ForegroundColor Red
        Write-Host "Vui long chay 'yarn build' truoc khi dong goi." -ForegroundColor Yellow
        exit 1
    }
} else {
    $buildId = Get-Content $buildIdPath -ErrorAction SilentlyContinue
    Write-Host "[OK] Tim thay BUILD_ID: $buildId" -ForegroundColor Green
    Write-Host "Day la production build, co the dong goi an toan.`n" -ForegroundColor Green
}

$packageName = "nextjs-app-production-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$tempDir = ".\$packageName"

Write-Host "=== Bat dau dong goi ===" -ForegroundColor Cyan
Write-Host "Ten goi: $packageName`n" -ForegroundColor Green

# Tao thu muc tam
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy cac file va thu muc can thiet
Write-Host "Dang copy cac file can thiet..." -ForegroundColor Yellow

# Copy thu muc .next (build output)
if (Test-Path ".\.next") {
    Copy-Item -Path ".\.next" -Destination "$tempDir\.next" -Recurse -Force
    Write-Host "  [OK] .next" -ForegroundColor Gray
}

# Copy thu muc public (static assets)
if (Test-Path ".\public") {
    Copy-Item -Path ".\public" -Destination "$tempDir\public" -Recurse -Force
    Write-Host "  [OK] public" -ForegroundColor Gray
}

# Copy thu muc src (source code - can thiet cho production)
if (Test-Path ".\src") {
    Copy-Item -Path ".\src" -Destination "$tempDir\src" -Recurse -Force
    Write-Host "  [OK] src" -ForegroundColor Gray
}

# Copy cac file config va package files
$filesToCopy = @(
    "package.json",
    "yarn.lock",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "next-env.d.ts"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$tempDir\$file" -Force
        Write-Host "  [OK] $file" -ForegroundColor Gray
    }
}

# Copy README neu co
if (Test-Path ".\README-DISTRIBUTION.md") {
    Copy-Item -Path ".\README-DISTRIBUTION.md" -Destination "$tempDir\README.md" -Force
    Write-Host "  [OK] README.md" -ForegroundColor Gray
}

Write-Host "`nDang tao file ZIP..." -ForegroundColor Yellow

# Tao file ZIP
$zipPath = ".\$packageName.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Xoa thu muc tam
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "`n=== KET QUA ===" -ForegroundColor Cyan
Write-Host "[SUCCESS] Dong goi thanh cong!" -ForegroundColor Green
Write-Host "File ZIP: $zipPath" -ForegroundColor Cyan

# Kiem tra kich thuoc file
$fileSize = (Get-Item $zipPath).Length / 1MB
Write-Host "Kich thuoc: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray

Write-Host "`nBan co the gui file nay cho nguoi khac su dung." -ForegroundColor Yellow
Write-Host "Nguoi nhan chi can: yarn install -> yarn start" -ForegroundColor Gray
