# Deploy Authentication Fix for BookStore App (PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "BookStore App - Authentication Fix Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the updated backend image
Write-Host "[Step 1/4] Building updated backend Docker image..." -ForegroundColor Yellow
Set-Location backend
docker build -t mokadir/bookstore-backend:12 .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Push to Docker registry
Write-Host ""
Write-Host "[Step 2/4] Pushing image to Docker registry..." -ForegroundColor Yellow
docker push mokadir/bookstore-backend:12

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker push failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Update Kubernetes deployment image version
Write-Host ""
Write-Host "[Step 3/4] Updating Kubernetes deployment..." -ForegroundColor Yellow
Set-Location ..
kubectl set image deployment/bookstore-backend bookstore-backend=mokadir/bookstore-backend:12 -n ns-bookstoreapp

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Kubernetes update failed!" -ForegroundColor Red
    exit 1
}

# Apply the updated FRONTEND_URL configuration
kubectl apply -f k8s/bookstore-backend.yaml

# Step 4: Wait for rollout to complete
Write-Host ""
Write-Host "[Step 4/4] Waiting for deployment to complete..." -ForegroundColor Yellow
kubectl rollout status deployment/bookstore-backend -n ns-bookstoreapp

# Verify pods are running
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Status:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
kubectl get pods -n ns-bookstoreapp -l app=bookstore-backend

# Show recent logs
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Backend Logs (last 20 lines):" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=20

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Test the application at: http://localhost:30022" -ForegroundColor White
Write-Host ""
Write-Host "Try logging in with demo credentials:" -ForegroundColor White
Write-Host "  Email: john@example.com" -ForegroundColor White
Write-Host "  Password: customer123" -ForegroundColor White
Write-Host ""
