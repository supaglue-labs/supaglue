@echo off
setlocal

set url=https://d379ao5oasu7j7.cloudfront.net/quickstart.env
set output=.env

echo Downloading file from %url%...

powershell.exe -Command "(New-Object System.Net.WebClient).DownloadFile('%url%', '%output%')"

set url=https://d379ao5oasu7j7.cloudfront.net/mgmt-ui-quickstart.env
set output=apps/mgmt-ui/.env

echo Downloading file from %url%...

powershell.exe -Command "(New-Object System.Net.WebClient).DownloadFile('%url%', '%output%')"

echo Done!
