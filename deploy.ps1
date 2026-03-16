# Deploy to Oracle Cloud server
Write-Host "Building and deploying to Oracle Cloud..." -ForegroundColor Cyan

# Push to oracle remote
git push oracle HEAD:master

Write-Host "Deploy complete! Site: http://158.178.131.205" -ForegroundColor Green
