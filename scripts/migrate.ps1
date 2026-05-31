#!/usr/bin/env pwsh
# Supabase Migration Script untuk TeleDrive
# Memudahkan proses push migration ke Supabase

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "push", "status", "link", "pull")]
    [string]$Command = "push"
)

$projectId = "pnbilvxvdryqzarkwbza"
$migrationsDir = ".\supabase\migrations"

function Get-AccessToken {
    # Cek apakah SUPABASE_ACCESS_TOKEN sudah di-set
    if ($env:SUPABASE_ACCESS_TOKEN) {
        return $env:SUPABASE_ACCESS_TOKEN
    }
    
    Write-Host "🔑 Supabase Access Token tidak ditemukan" -ForegroundColor Yellow
    Write-Host "📍 Dapatkan dari: https://supabase.com/dashboard/account/tokens" -ForegroundColor Cyan
    $token = Read-Host "Masukkan Access Token (format: sbp_...)"
    
    if (-not $token.StartsWith("sbp_")) {
        Write-Host "❌ Error: Token harus dimulai dengan 'sbp_'" -ForegroundColor Red
        exit 1
    }
    
    # Set environment variable untuk session ini
    $env:SUPABASE_ACCESS_TOKEN = $token
    
    Write-Host "✅ Access token berhasil di-set" -ForegroundColor Green
    return $token
}

function Invoke-LinkProject {
    Write-Host "🔗 Linking project ke Supabase..." -ForegroundColor Cyan
    
    $token = Get-AccessToken
    npx supabase link --project-ref $projectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Project berhasil di-link!" -ForegroundColor Green
    } else {
        Write-Host "❌ Gagal link project" -ForegroundColor Red
        exit 1
    }
}

function Invoke-PushMigrations {
    Write-Host "📤 Pushing migrations ke Supabase..." -ForegroundColor Cyan
    
    $token = Get-AccessToken
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations berhasil di-push!" -ForegroundColor Green
    } else {
        Write-Host "❌ Gagal push migrations" -ForegroundColor Red
        exit 1
    }
}

function Invoke-CheckStatus {
    Write-Host "📊 Checking migration status..." -ForegroundColor Cyan
    
    $token = Get-AccessToken
    npx supabase db status
}

function Invoke-PullMigrations {
    Write-Host "📥 Pulling remote migrations..." -ForegroundColor Cyan
    
    $token = Get-AccessToken
    npx supabase db pull
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Remote migrations berhasil di-pull!" -ForegroundColor Green
    } else {
        Write-Host "❌ Gagal pull migrations" -ForegroundColor Red
        exit 1
    }
}

function Invoke-FullSetup {
    Write-Host "🚀 Menjalankan full setup..." -ForegroundColor Magenta
    Write-Host ""
    
    # Step 1: Link
    Invoke-LinkProject
    Write-Host ""
    
    # Step 2: Push migrations
    Invoke-PushMigrations
    Write-Host ""
    
    # Step 3: Check status
    Invoke-CheckStatus
    Write-Host ""
    
    Write-Host "🎉 Setup selesai! Database migrations sudah di-push ke Supabase." -ForegroundColor Green
}

function Show-Help {
    Write-Host "TeleDrive Supabase Migration Tool" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\scripts\migrate.ps1 [Command]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  setup   - Link project + push migrations (recommended first time)" -ForegroundColor Green
    Write-Host "  push    - Push pending migrations ke Supabase" -ForegroundColor Green
    Write-Host "  status  - Check migration status" -ForegroundColor Green
    Write-Host "  link    - Link project ke Supabase" -ForegroundColor Green
    Write-Host "  pull    - Pull remote migrations" -ForegroundColor Green
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\scripts\migrate.ps1 setup" -ForegroundColor Cyan
    Write-Host "  .\scripts\migrate.ps1 push" -ForegroundColor Cyan
}

# Main
switch ($Command) {
    "setup" { Invoke-FullSetup }
    "push" { Invoke-PushMigrations }
    "status" { Invoke-CheckStatus }
    "link" { Invoke-LinkProject }
    "pull" { Invoke-PullMigrations }
    "help" { Show-Help }
    default { Show-Help }
}
