@echo off
setlocal

set url=https://supaglue-public-config.s3.us-west-2.amazonaws.com/quickstart.env
set output=.env

echo Downloading file from %url%...

powershell.exe -Command "(New-Object System.Net.WebClient).DownloadFile('%url%', '%output%')"

echo Done!
