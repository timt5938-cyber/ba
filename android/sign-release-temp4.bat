@echo off
"C:\Users\bober\AppData\Local\Android\Sdk\build-tools\36.1.0\zipalign.exe" -f -p 4 "C:\dota\android\app\build\outputs\apk\release\app-release-unsigned.apk" "C:\dota\android\app\build\outputs\apk\release\app-release-aligned.apk"
set KSPASS=ssskkkiiieee
set KPASS=ssskkkiiieee
"C:\Users\bober\AppData\Local\Android\Sdk\build-tools\36.1.0\apksigner.bat" sign --ks "C:\dota\android\keystore\dota-scope-release.jks" --ks-key-alias ssskkkiiieee --ks-pass env:KSPASS --key-pass env:KPASS --out "C:\dota\android\app\build\outputs\apk\release\app-release-signed.apk" "C:\dota\android\app\build\outputs\apk\release\app-release-aligned.apk"
