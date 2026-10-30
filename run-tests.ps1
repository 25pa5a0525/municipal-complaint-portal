$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\server"
Write-Host "Starting server..."
$serverProc = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru
Start-Sleep -Seconds 3

try {
    Set-Location "$PSScriptRoot"
    Write-Host "Running tests..."
    node test-suite.js
    $testExit = $LASTEXITCODE
}
finally {
    Write-Host "Stopping test server..."
    if ($serverProc -and -not $serverProc.HasExited) {
        Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
    }
}

exit $testExit
