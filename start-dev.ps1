$env:NODE_ENV = 'development'
$env:PORT = '5000'
Set-Location -LiteralPath $PSScriptRoot
& "$PSScriptRoot\node_modules\.bin\tsx.cmd" server/index.ts 2>&1 | Tee-Object -FilePath "$PSScriptRoot\server-dev.log"
