# IDONG OS Database Backup Automation Script
# Backs up the SQLite database to the backups/ folder and keeps the 7 most recent copies.

$dbFile = "prisma/prisma/dev.db"
$backupDir = "backups"

# Ensure the database file exists
if (-not (Test-Path $dbFile)) {
    Write-Error "Error: Database file not found at $dbFile"
    Exit 1
}

# Ensure the backup directory exists
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Write-Host "Created backup directory: $backupDir"
}

# Generate Timestamp
$timestamp = Get-Date -Format "yyyy_MM_dd_HHmmss"
$backupFileName = "db_backup_$timestamp.db"
$backupFilePath = Join-Path $backupDir $backupFileName

# Copy Database
Copy-Item $dbFile -Destination $backupFilePath -Force
Write-Host "Database backup created successfully: $backupFilePath"

# Cleanup: Keep only the 7 most recent backups
$backups = Get-ChildItem "$backupDir/db_backup_*.db" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 7) {
    Write-Host "Cleaning up older backups..."
    $backups | Select-Object -Skip 7 | ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Host "Deleted old backup file: $($_.Name)"
    }
}
