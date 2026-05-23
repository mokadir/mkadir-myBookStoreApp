# Troubleshoot and Deploy Authentication Fix

## Current Status
- ✅ Code fix implemented (CORS configuration updated)
- ✅ Kubernetes YAML updated to use image version :12
- ❌ Backend still showing old behavior (login/registration failing)

## Root Cause
The backend pods are still running the **OLD image** (version :11) without the CORS fix. You need to:
1. Build new Docker image with the updated code
2. Push it to Docker Hub
3. Force Kubernetes to pull and use the new image

---

## SOLUTION: Deploy the Fix

### Option A: Build, Push, and Deploy (Recommended)

**Step 1: Build the new image**
```powershell
cd backend
docker build -t mokadir/bookstore-backend:12 .
cd ..
```

**Step 2: Push to Docker Hub**
```powershell
docker push mokadir/bookstore-backend:12
```

**Step 3: Force Kubernetes to restart with new image**
```powershell
# Delete the existing pod to force recreation
kubectl delete pod -n ns-bookstoreapp -l app=bookstore-backend

# OR use rollout restart
kubectl rollout restart deployment/bookstore-backend -n ns-bookstoreapp
```

**Step 4: Wait for pod to be ready**
```powershell
kubectl rollout status deployment/bookstore-backend -n ns-bookstoreapp
```

**Step 5: Verify new image is running**
```powershell
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=30
```

---

### Option B: If Kubectl Context is Broken

If kubectl commands fail with context errors, first fix kubectl:

```powershell
# List available contexts
kubectl config get-contexts

# If empty or wrong context, set it
kubectl config use-context <your-context-name>

# Common contexts:
# - docker-desktop
# - minikube
# - kind-kind
```

Then proceed with Option A steps above.

---

### Option C: Quick Test Without Rebuild

If you want to verify the CORS fix works locally first:

```powershell
# Run backend locally with new code
cd backend
npm install
npm start
```

Then access frontend at `http://localhost:30022` and it should connect to local backend on port 5000.

---

## Verification Steps

### 1. Check if new image was built
```powershell
docker images mokadir/bookstore-backend
```
**Expected:** You should see version :12 with a recent creation date

### 2. Check if pod is using new image
```powershell
kubectl describe pod -n ns-bookstoreapp -l app=bookstore-backend | Select-String "Image:"
```
**Expected:** `Image: mokadir/bookstore-backend:12`

### 3. Check pod startup time
```powershell
kubectl get pods -n ns-bookstoreapp -l app=bookstore-backend
```
**Expected:** AGE should be recent (a few minutes)

### 4. Check backend logs for CORS info
```powershell
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=50
```
**Expected:** Should see MongoDB connected message

### 5. Test in Browser
- Go to: `http://localhost:30022`
- Open browser DevTools (F12)
- Go to Console tab
- Try to login or register
- **Expected:** No CORS errors in console

---

## Still Not Working? Additional Checks

### Check 1: Is Docker image actually updated?
```powershell
# Check image ID
docker images mokadir/bookstore-backend:12 --format "{{.ID}} {{.CreatedAt}}"

# Verify it was created TODAY
```

### Check 2: Is imagePullPolicy working?
The deployment uses `imagePullPolicy: Always`, which should pull the latest image. But Kubernetes might cache it.

**Solution:** Force image pull by deleting the pod:
```powershell
kubectl delete pod -n ns-bookstoreapp -l app=bookstore-backend
```

### Check 3: Check actual running image in pod
```powershell
kubectl get pod -n ns-bookstoreapp -l app=bookstore-backend -o jsonpath='{.items[0].status.containerStatuses[0].imageID}'
```

### Check 4: Browser Cache
Even with CORS fixed, browser might cache the old CORS error:
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Try incognito/private window

---

## Quick Command Reference

```powershell
# Build and deploy in one go
cd backend && docker build -t mokadir/bookstore-backend:12 . && cd .. && docker push mokadir/bookstore-backend:12 && kubectl rollout restart deployment/bookstore-backend -n ns-bookstoreapp

# Check status
kubectl get pods -n ns-bookstoreapp

# View logs
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=50 -f

# Access app
start http://localhost:30022
```

---

## Expected Behavior After Fix

### Before Fix:
- Browser console shows: `Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' from origin 'http://localhost:30022' has been blocked by CORS policy`
- Login/Registration shows: "Login failed" or "Registration failed"

### After Fix:
- No CORS errors in browser console
- Successful login redirects to home page
- Successful registration creates account and redirects
- JWT token stored in localStorage
- User name appears in header

---

## Need Help?

1. **Run this diagnostic:**
```powershell
Write-Host "=== Diagnostic Info ===" -ForegroundColor Cyan
Write-Host "`nDocker Images:" -ForegroundColor Yellow
docker images mokadir/bookstore-backend

Write-Host "`nKubernetes Deployment:" -ForegroundColor Yellow
kubectl get deployment bookstore-backend -n ns-bookstoreapp

Write-Host "`nKubernetes Pods:" -ForegroundColor Yellow
kubectl get pods -n ns-bookstoreapp -l app=bookstore-backend

Write-Host "`nBackend Logs (last 20):" -ForegroundColor Yellow
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=20
```

2. **Share the output** of the diagnostic above

---

**Last Updated:** May 23, 2026  
**Status:** Awaiting deployment of image version :12
