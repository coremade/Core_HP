@echo off
set BACKUP_DIR=C:\Projects\CORE_HP\shared\backups
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%

mysqldump -u root -p dev_management > %BACKUP_DIR%\db_backup_%DATE%_%TIME%.sql

xcopy C:\Projects\CORE_HP\frontend %BACKUP_DIR%\frontend_%DATE%_%TIME% /E /I /H
xcopy C:\Projects\CORE_HP\backend %BACKUP_DIR%\backend_%DATE%_%TIME% /E /I /H
