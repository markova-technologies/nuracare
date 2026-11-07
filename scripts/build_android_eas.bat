@echo off
setlocal
set "TEMP=D:\Temp"
set "TMP=D:\Temp"
pushd "D:\Projects\Markova Projects\nuracare\apps\mobile"
call eas project:info
call eas build --platform android --profile preview --non-interactive --no-wait
popd
