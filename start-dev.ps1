$env:NODE_ENV = 'development'
$env:PORT = '5000'
Set-Location -LiteralPath $PSScriptRoot
npx tsx server/index.ts 2>&1 | Tee-Object -FilePath "$PSScriptRoot\server-dev.log"
