# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {
        $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
        Start-Process -FilePath PowerShell.exe -Verb Runas -ArgumentList $CommandLine
        Exit
    }
}

# 1. Install dependencies
Write-Host "Installing Node.js..."
winget install OpenJS.NodeJS.LTS

Write-Host "Installing Git..."
winget install Git.Git

Write-Host "Installing Visual Studio Code..."
winget install Microsoft.VisualStudioCode

Write-Host "Installing MySQL..."
winget install Oracle.MySQL

Write-Host "Installing Docker Desktop..."
winget install Docker.DockerDesktop

Write-Host "MySQL Workbench installing..."
winget install Oracle.MySQLWorkbench


# 2. Create project directory structure
$projectPath = "C:\Projects\CORE_HP"
$subdirs = @(
    "frontend",
    "backend",
    "shared\resources",
    "shared\documents",
    "shared\databases",
    "shared\tools",
    "shared\backups"
)

foreach ($dir in $subdirs) {
    $fullPath = Join-Path $projectPath $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force
    }
}

# 3. Initialize Next.js apps
Write-Host "Creating Next.js apps..."

$frontendPath = Join-Path $projectPath "frontend"
$backendNextPath = Join-Path $projectPath "backend"

if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
    Write-Host "Creating frontend Next.js app..."
    Set-Location $projectPath
    npx create-next-app@latest frontend --typescript --no-git --use-npm
}

if (-not (Test-Path (Join-Path $backendNextPath "package.json"))) {
    Write-Host "Creating backend Next.js app..."
    Set-Location $projectPath
    npx create-next-app@latest backend --typescript --no-git --use-npm
}

# 4. Configure Git global settings
Write-Host "Configuring Git global settings..."
git config --global core.autocrlf true
git config --global core.safecrlf warn
git config --global init.defaultBranch main


# 6. Create backup script
Write-Host "Creating backup script..."

$backupScript = @"
@echo off
set BACKUP_DIR=C:\Projects\project-name\shared\backups
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%

mysqldump -u root -p dev_management > %BACKUP_DIR%\db_backup_%DATE%_%TIME%.sql

xcopy C:\Projects\project-name\frontend %BACKUP_DIR%\frontend_%DATE%_%TIME% /E /I /H
xcopy C:\Projects\project-name\backend %BACKUP_DIR%\backend_%DATE%_%TIME% /E /I /H
"@

$backupScript | Out-File -FilePath "$projectPath\shared\tools\backup.bat" -Encoding ASCII

# 7. Final message
Write-Host "`nSetup complete."
Write-Host "Project root: $projectPath"
Write-Host "Directory structure:"
Write-Host " - frontend       : User interface (Next.js)"
Write-Host " - backend        : API server (Next.js API Routes)"
Write-Host " - shared         : Shared resources, docs, and backups"
Write-Host "`nNext steps:"
Write-Host "1. Restart your PC"
Write-Host "2. Configure Git user.name and user.email"
Write-Host "3. You will need to enter MySQL root password during setup"
Write-Host "4. Add docker-compose.yml or README.md as needed" 