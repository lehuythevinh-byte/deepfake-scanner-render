$ErrorActionPreference = 'Stop'
$repoUrl = 'https://github.com/lehuythevinh-byte/deepfake-scanner-render.git'
$branch = 'release/v5.0.1-localhost-ready-20261104'
$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$destination = Join-Path $env:USERPROFILE 'Downloads\deepfake-scanner-v501-github-upload'
$logPath = Join-Path $source 'PUSH_TO_GITHUB_LOG.txt'

function Write-Step([string]$Message) {
  Write-Host "`n$Message" -ForegroundColor Cyan
}
function Invoke-Git([string[]]$Arguments) {
  & git @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Lenh git that bai (exit $LASTEXITCODE): git $($Arguments -join ' ')"
  }
}

try {
  Start-Transcript -Path $logPath -Force | Out-Null
  Write-Host 'Deepfake Scanner V5.0.1 - cong cu push an toan len GitHub' -ForegroundColor Green
  Write-Host "Thu muc nguon: $source"

  if (-not (Test-Path -LiteralPath (Join-Path $source 'package.json'))) {
    throw 'Khong tim thay package.json. Hay giai nen TOAN BO ZIP roi chay file BAT trong thu muc Deepfake_Scanner_V5_Advanced.'
  }
  if ($source -match '\\AppData\\Local\\Temp\\|\\INetCache\\') {
    throw 'Ban dang chay file truc tiep tu ZIP / thu muc tam. Hay giai nen ZIP ra Downloads truoc, sau do chay lai.'
  }
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Khong tim thay Git. Hay cai Git for Windows va mo lai file BAT.'
  }

  Write-Step '[1/7] Chuan bi nhanh GitHub'
  if (Test-Path -LiteralPath $destination) {
    if (Test-Path -LiteralPath (Join-Path $destination '.git')) {
      Push-Location $destination
      try {
        $currentRemote = (& git remote get-url origin 2>$null | Select-Object -First 1)
        if ($LASTEXITCODE -ne 0 -or $currentRemote.TrimEnd('/') -ne $repoUrl.TrimEnd('/')) {
          throw "Thu muc tam da ton tai nhung remote khong dung: $destination. Khong tu dong xoa de tranh mat du lieu."
        }
        Invoke-Git @('fetch', 'origin', $branch)
        Invoke-Git @('checkout', $branch)
        Invoke-Git @('pull', '--ff-only', 'origin', $branch)
      }
      finally { Pop-Location }
    }
    else {
      $destination = Join-Path $env:USERPROFILE ("Downloads\deepfake-scanner-v501-github-upload-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
      Write-Host "Thu muc cu khong phai Git clone; se dung thu muc moi: $destination" -ForegroundColor Yellow
    }
  }

  if (-not (Test-Path -LiteralPath (Join-Path $destination '.git'))) {
    Write-Host 'Dang clone nhanh phat hanh tu GitHub. Hay giu cua so mo...'
    & git clone --branch $branch --single-branch $repoUrl $destination
    if ($LASTEXITCODE -ne 0) { throw "Git clone that bai (exit $LASTEXITCODE). Kiem tra mang / quyen GitHub." }
  }

  Write-Step '[2/7] Lam sach noi dung clone tam (giu nguyen .git)'
  Get-ChildItem -LiteralPath $destination -Force |
    Where-Object { $_.Name -ne '.git' } |
    Remove-Item -Recurse -Force

  Write-Step '[3/7] Copy ma nguon V5'
  $robocopyArgs = @(
    $source, $destination, '/E', '/R:2', '/W:2', '/NFL', '/NDL', '/NP',
    '/XD', 'node_modules', 'dist', 'coverage', '.cache', '.git',
    '/XF', '.env', '.env.local', '.env.production', '.env.development', '.env.test',
    '.env.*.local', '.npmrc', '*.log', 'PUSH_TO_GITHUB_LOG.txt'
  )
  & robocopy.exe @robocopyArgs
  $copyCode = $LASTEXITCODE
  if ($copyCode -ge 8) { throw "Robocopy loi (exit $copyCode). Khong tiep tuc push." }
  if (Test-Path -LiteralPath (Join-Path $destination '.env')) {
    throw 'Phat hien .env trong thu muc Git; dung de tranh lo API key.'
  }

  Write-Step '[4/7] Kiem tra va stage cac file'
  Push-Location $destination
  try {
    Invoke-Git @('add', '-A')
    $staged = @(& git diff --cached --name-only)
    if ($LASTEXITCODE -ne 0) { throw 'Khong doc duoc danh sach file staged.' }
    if ($staged.Count -eq 0) {
      Write-Host 'Khong co file thay doi de commit; se thu push commit co san neu co.' -ForegroundColor Yellow
    }

    $unsafePattern = '(^|/)\.env($|\.(?!example$))|(^|/)\.npmrc$|(^|/)(id_rsa|id_ed25519|.*\.pem|.*\.p12|.*\.pfx)$|(^|/)(credentials|service-account)\.json$'
    $unsafe = @($staged | Where-Object { $_ -match $unsafePattern })
    if ($unsafe.Count -gt 0) {
      Write-Host 'Phat hien tep co the chua bi mat:' -ForegroundColor Red
      $unsafe | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
      throw 'Da dung truoc commit. Hay loai bo / doi ten tep nhay cam.'
    }

    Write-Host "So tep staged: $($staged.Count)"
    $staged | Select-Object -First 80 | ForEach-Object { Write-Host "  $_" }
    if ($staged.Count -gt 80) { Write-Host "  ... va $($staged.Count - 80) tep khac" }
    Write-Host ''
    Write-Host 'KHONG push .env, API key, DATABASE_URL, mat khau hoac node_modules.' -ForegroundColor Yellow
    $confirm = Read-Host "Nhap PUSH de xac nhan dua ma nguon len nhanh $branch"
    if ($confirm -cne 'PUSH') {
      Write-Host 'Da huy theo yeu cau. Khong tao commit / khong push.' -ForegroundColor Yellow
      return
    }

    Write-Step '[5/7] Kiem tra thong tin commit'
    $gitName = (& git config user.name 2>$null | Select-Object -First 1)
    $gitEmail = (& git config user.email 2>$null | Select-Object -First 1)
    if ([string]::IsNullOrWhiteSpace($gitName)) {
      $gitName = (& git log -1 --format=%an 2>$null | Select-Object -First 1)
      if (-not [string]::IsNullOrWhiteSpace($gitName)) { Invoke-Git @('config', 'user.name', $gitName) }
    }
    if ([string]::IsNullOrWhiteSpace($gitEmail)) {
      $gitEmail = (& git log -1 --format=%ae 2>$null | Select-Object -First 1)
      if (-not [string]::IsNullOrWhiteSpace($gitEmail)) { Invoke-Git @('config', 'user.email', $gitEmail) }
    }
    if ([string]::IsNullOrWhiteSpace($gitName) -or [string]::IsNullOrWhiteSpace($gitEmail)) {
      throw 'Git chua co user.name / user.email. Hay cau hinh: git config --global user.name "Ten cua ban" va git config --global user.email "Email GitHub".'
    }

    Write-Step '[6/7] Tao commit neu co thay doi'
    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 1) {
      Invoke-Git @('commit', '-m', 'release: Deepfake Scanner V5.0.1 Localhost Ready')
    }
    elseif ($LASTEXITCODE -ne 0) { throw 'Khong kiem tra duoc staged diff.' }
    else { Write-Host 'Khong co thay doi moi; bo qua commit.' }

    Write-Step '[7/7] Push len GitHub'
    Write-Host 'Dang push. Neu Git yeu cau dang nhap, hay hoan tat trong cua so nay...'
    Invoke-Git @('push', '-u', 'origin', $branch)
    Write-Host ''
    Write-Host '[THANH CONG] Ma nguon da duoc push len GitHub.' -ForegroundColor Green
    Write-Host "https://github.com/lehuythevinh-byte/deepfake-scanner-render/tree/$branch" -ForegroundColor Green
    Write-Host 'Nhanh main va Render production khong bi thay doi.' -ForegroundColor Green
  }
  finally { Pop-Location }
}
catch {
  Write-Host ''
  Write-Host '[LOI] Qua trinh push dung lai:' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host "Log: $logPath" -ForegroundColor Yellow
  exit 1
}
finally {
  try { Stop-Transcript | Out-Null } catch {}
}
