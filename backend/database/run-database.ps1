# ====================================
# MYSQL DATABASE CREATION SCRIPT
# ====================================

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "complete_forum_database.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FORUM DATABASE CREATION TOOL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found at: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "SQL File: $sqlFile" -ForegroundColor Green
Write-Host ""

# ====================================
# SEARCH FOR MYSQL
# ====================================

Write-Host "Searching for MySQL installation..." -ForegroundColor Yellow
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe",
    "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"
)

$mysqlPath = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        Write-Host "Found MySQL at: $mysqlPath" -ForegroundColor Green
        break
    }
}

# ====================================
# METHOD 1: AUTO-DETECT MYSQL
# ====================================

if ($mysqlPath) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "  AUTO-DETECTED MYSQL" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Use auto-detected MySQL? (Y/N)"
    if ($choice -eq "Y" -or $choice -eq "y") {
        Write-Host ""
        Write-Host "Step 1: Enter MySQL credentials..." -ForegroundColor Yellow
        
        # Get credentials
        $username = Read-Host "Enter MySQL username (default: root)"
        if ([string]::IsNullOrWhiteSpace($username)) {
            $username = "root"
        }
        
        Write-Host "Enter MySQL password (press Enter if no password):" -ForegroundColor Yellow
        $password = Read-Host -AsSecureString
        $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
        )
        
        try {
            Write-Host ""
            Write-Host "Step 1: Creating database..." -ForegroundColor Yellow
            
            # Create database
            $createDbCmd = "CREATE DATABASE IF NOT EXISTS company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            if ($passwordText) {
                & $mysqlPath -u $username -p"$passwordText" -e $createDbCmd
            } else {
                & $mysqlPath -u $username -e $createDbCmd
            }
            
            Write-Host "Step 2: Importing schema and data..." -ForegroundColor Yellow
            
            # Import SQL file
            if ($passwordText) {
                Get-Content $sqlFile | & $mysqlPath -u $username -p"$passwordText" company_forum
            } else {
                Get-Content $sqlFile | & $mysqlPath -u $username company_forum
            }
            
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  DATABASE CREATED SUCCESSFULLY!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Database Name: company_forum" -ForegroundColor Cyan
            Write-Host "Tables: 44 tables created" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Sample Login Credentials:" -ForegroundColor Yellow
            Write-Host "  Admin: admin@company.com / Password123!" -ForegroundColor White
            Write-Host "  User:  john.doe@company.com / Password123!" -ForegroundColor White
            Write-Host ""
            
        } catch {
            Write-Host ""
            Write-Host "ERROR: Failed to create database" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit 0
    }
}

# ====================================
# METHOD 2: MYSQL WORKBENCH (RECOMMENDED)
# ====================================

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  METHOD 2: MYSQL WORKBENCH" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you have MySQL Workbench installed:" -ForegroundColor Yellow
Write-Host "1. Open MySQL Workbench" -ForegroundColor White
Write-Host "2. Connect to your MySQL server" -ForegroundColor White
Write-Host "3. File > Open SQL Script..." -ForegroundColor White
Write-Host "4. Select: $sqlFile" -ForegroundColor White
Write-Host "5. Click Execute (Lightning bolt icon)" -ForegroundColor White
Write-Host ""

# ====================================
# METHOD 3: PHPMYADMIN
# ====================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  METHOD 3: PHPMYADMIN" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you have phpMyAdmin installed:" -ForegroundColor Yellow
Write-Host "1. Open phpMyAdmin in browser (usually http://localhost/phpmyadmin)" -ForegroundColor White
Write-Host "2. Click 'SQL' tab at the top" -ForegroundColor White
Write-Host "3. Click 'Choose File' and select: $sqlFile" -ForegroundColor White
Write-Host "4. Click 'Go' button" -ForegroundColor White
Write-Host ""

# ====================================
# METHOD 4: MANUAL COMMAND LINE
# ====================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  METHOD 4: COMMAND LINE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If MySQL is installed but not in PATH:" -ForegroundColor Yellow
Write-Host "1. Find your MySQL bin folder, usually at:" -ForegroundColor White
Write-Host "   - C:\Program Files\MySQL\MySQL Server 8.0\bin" -ForegroundColor Gray
Write-Host "   - C:\xampp\mysql\bin" -ForegroundColor Gray
Write-Host "   - C:\wamp64\bin\mysql\mysql8.x.x\bin" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open PowerShell and run:" -ForegroundColor White
Write-Host '   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"' -ForegroundColor Gray
Write-Host '   .\mysql -u root -p -e "CREATE DATABASE company_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"' -ForegroundColor Gray
Write-Host "   Get-Content `"$sqlFile`" | .\mysql -u root -p company_forum" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Choose one of the methods above to create your database." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
