@echo off
setlocal
cd /d "%~dp0"
set "ATLAS_ROOT=%~dp0"
echo.
echo   Disease Atlas - local server
echo   Address: http://localhost:8000
echo   Close this window to stop the server.
echo.
powershell -NoProfile -Command "$root=$env:ATLAS_ROOT; $l=New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:8000/'); try{$l.Start()}catch{Write-Host ('Could not start the local server: '+$_.Exception.Message); pause; exit 1}; Start-Process 'http://localhost:8000/'; while($l.IsListening){$c=$l.GetContext(); $p=$c.Request.Url.LocalPath; if($p -eq '/'){$p='/Disease-Atlas-Single-File.html'}; $full=[IO.Path]::GetFullPath((Join-Path $root $p.TrimStart('/'))); if($full.StartsWith([IO.Path]::GetFullPath($root),[StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $full -PathType Leaf)){$e=[IO.Path]::GetExtension($full).ToLower(); $t=@{'.html'='text/html; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.css'='text/css; charset=utf-8';'.svg'='image/svg+xml'}[$e]; if($t){$c.Response.ContentType=$t}; $b=[IO.File]::ReadAllBytes($full); $c.Response.OutputStream.Write($b,0,$b.Length)}else{$c.Response.StatusCode=404}; $c.Response.Close()}"
pause
