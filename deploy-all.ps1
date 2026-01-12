Write-Host "Starting full deployment process..." -ForegroundColor Cyan

# 1. Build
Write-Host "1. Running Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Aborting."
    exit 1
}

# 2. Add
Write-Host "2. Staging changes..." -ForegroundColor Yellow
git add .

# 3. Commit
Write-Host "3. Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto-deploy: $timestamp"

# 4. Push
Write-Host "4. Pushing to remote..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Error "Push failed. Aborting."
    exit 1
}

# 5. Deploy to Vercel
Write-Host "5. Deploying to Vercel Production..." -ForegroundColor Yellow
vercel deploy --prod

Write-Host "Deployment complete!" -ForegroundColor Green
