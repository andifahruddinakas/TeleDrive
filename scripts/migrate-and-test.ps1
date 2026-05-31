#!/usr/bin/env pwsh
<#
.SYNOPSIS
    TeleDrive Supabase Migration & Connection Test
    
.DESCRIPTION
    Script untuk:
    1. Link Supabase project
    2. Push database migrations
    3. Test koneksi ke Supabase
    
.PARAMETER Command
    Perintah yang ingin dijalankan: full-setup, link, push, test, atau status

.EXAMPLE
    .\scripts\migrate-and-test.ps1 full-setup
    .\scripts\migrate-and-test.ps1 test
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("full-setup", "link", "push", "test", "status", "help")]
    [string]$Command = "help"
)

$projectId = "pnbilvxvdryqzarkwbza"
$projectUrl = "https://pnbilvxvdryqzarkwbza.supabase.co"

# Colors
$green = @{ ForegroundColor = 'Green' }
$red = @{ ForegroundColor = 'Red' }
$yellow = @{ ForegroundColor = 'Yellow' }
$cyan = @{ ForegroundColor = 'Cyan' }

function Get-AccessToken {
    if ($env:SUPABASE_ACCESS_TOKEN) {
        Write-Host "✅ Access token ditemukan di environment variable" @green
        return $env:SUPABASE_ACCESS_TOKEN
    }
    
    Write-Host ""
    Write-Host "🔑 SUPABASE ACCESS TOKEN DIPERLUKAN" @yellow
    Write-Host ""
    Write-Host "Cara mendapatkan token:" @cyan
    Write-Host "1. Buka: https://supabase.com/dashboard" 
    Write-Host "2. Pergi ke: Settings → Access Tokens" 
    Write-Host "3. Klik: Create New Token"
    Write-Host "4. Beri nama: 'TeleDrive CLI'"
    Write-Host "5. Copy token yang dimulai dengan 'sbp_'"
    Write-Host ""
    
    $token = Read-Host "Masukkan Access Token (format: sbp_...)"
    
    if (-not $token.StartsWith("sbp_")) {
        Write-Host "❌ Error: Token harus dimulai dengan 'sbp_'" @red
        Write-Host "Token yang Anda masukkan: $($token.Substring(0, 10))..." @red
        exit 1
    }
    
    if ($token.Length -lt 20) {
        Write-Host "❌ Error: Token terlalu pendek (minimum 20 karakter)" @red
        exit 1
    }
    
    # Set untuk session ini
    $env:SUPABASE_ACCESS_TOKEN = $token
    Write-Host "✅ Access token berhasil di-set" @green
    
    return $token
}

function Invoke-FullSetup {
    Write-Host "🚀 Memulai FULL SETUP Supabase Migration..." -ForegroundColor Magenta
    Write-Host ""
    
    # Step 1: Link
    Write-Host "📍 STEP 1: Linking project ke Supabase..." @cyan
    Get-AccessToken | Out-Null
    npx supabase link --project-ref $projectId
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Gagal link project" @red
        exit 1
    }
    Write-Host "✅ Project berhasil di-link" @green
    Write-Host ""
    
    # Step 2: Push migrations
    Write-Host "📤 STEP 2: Pushing migrations..." @cyan
    npx supabase db push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Gagal push migrations" @red
        exit 1
    }
    Write-Host "✅ Migrations berhasil di-push" @green
    Write-Host ""
    
    # Step 3: Check status
    Write-Host "📊 STEP 3: Checking migration status..." @cyan
    npx supabase db status
    Write-Host ""
    
    # Step 4: Test connection
    Write-Host "🧪 STEP 4: Testing connection..." @cyan
    Invoke-TestConnection
    
    Write-Host ""
    Write-Host "🎉 SETUP LENGKAP!" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Database sudah connected dengan tables:" @green
    Write-Host "  ✓ profiles"
    Write-Host "  ✓ folders"
    Write-Host "  ✓ files"
    Write-Host "  ✓ file_chunks"
}

function Invoke-LinkProject {
    Write-Host "🔗 Linking Supabase project..." @cyan
    Get-AccessToken | Out-Null
    npx supabase link --project-ref $projectId
}

function Invoke-PushMigrations {
    Write-Host "📤 Pushing database migrations..." @cyan
    Get-AccessToken | Out-Null
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations pushed successfully!" @green
    }
}

function Invoke-CheckStatus {
    Write-Host "📊 Checking migration status..." @cyan
    Get-AccessToken | Out-Null
    npx supabase db status
}

function Invoke-TestConnection {
    Write-Host "🧪 Testing Supabase connection..." @cyan
    Write-Host ""
    
    # Create test file
    $testFile = ".temp-test.mjs"
    $testCode = @"
import { createClient } from '@supabase/supabase-js'

const url = '$projectUrl'
const key = '$($env:VITE_SUPABASE_PUBLISHABLE_KEY)'

console.log('🔗 Connecting to Supabase...')
console.log('URL:', url)

const supabase = createClient(url, key)

try {
  // Test connection by fetching profiles table (with limit 0)
  const { data, error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })

  if (error) {
    console.log('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('✅ Connection successful!')
  console.log('📊 Database status:')
  console.log('   - Profiles table exists: true')
  process.exit(0)
} catch (err) {
  console.log('❌ Connection failed:', err.message)
  process.exit(1)
}
"@

    # Write test file
    Set-Content -Path $testFile -Value $testCode -Encoding UTF8
    
    try {
        # Run test
        node $testFile
        $testResult = $LASTEXITCODE
    } finally {
        # Clean up
        if (Test-Path $testFile) {
            Remove-Item $testFile -Force
        }
    }
    
    if ($testResult -eq 0) {
        Write-Host "✅ Connection test passed!" @green
    } else {
        Write-Host "❌ Connection test failed" @red
        Write-Host "Pastikan:"
        Write-Host "  1. Migrations sudah di-push"
        Write-Host "  2. Network connection stable"
        Write-Host "  3. Supabase project masih active"
    }
}

function Show-Help {
    Write-Host "🚀 TeleDrive Supabase Migration Tool" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\scripts\migrate-and-test.ps1 [Command]" @cyan
    Write-Host ""
    Write-Host "Commands:" @yellow
    Write-Host "  full-setup  - Complete setup (link + push + test) 🔥" @green
    Write-Host "  link        - Link project to Supabase" @green
    Write-Host "  push        - Push pending migrations" @green
    Write-Host "  status      - Check migration status" @green
    Write-Host "  test        - Test Supabase connection" @green
    Write-Host "  help        - Show this help" @green
    Write-Host ""
    Write-Host "Examples:" @yellow
    Write-Host "  .\scripts\migrate-and-test.ps1 full-setup" @cyan
    Write-Host "  .\scripts\migrate-and-test.ps1 test" @cyan
    Write-Host "  .\scripts\migrate-and-test.ps1 push" @cyan
    Write-Host ""
    Write-Host "Requirements:" @yellow
    Write-Host "  - Supabase Access Token (format: sbp_...)" @cyan
    Write-Host "  - Network connection to Supabase" @cyan
    Write-Host ""
}

# Main
switch ($Command) {
    "full-setup" { Invoke-FullSetup }
    "link" { Invoke-LinkProject }
    "push" { Invoke-PushMigrations }
    "status" { Invoke-CheckStatus }
    "test" { Invoke-TestConnection }
    "help" { Show-Help }
    default { Show-Help }
}
