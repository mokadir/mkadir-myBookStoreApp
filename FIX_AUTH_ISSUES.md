# Authentication Login/Registration Fix

## Issues Identified

### 1. CORS Configuration Problem
**Root Cause:** The backend CORS was configured to only accept requests from `http://localhost:3000`, but the frontend is running on port 8080 in Kubernetes (NodePort 30022).

**Impact:** Browser blocks authentication API calls due to CORS policy violations.

### 2. Kubernetes Configuration Mismatch
**Root Cause:** Backend deployment had `FRONTEND_URL=http://bookstore-frontend:3000` but the frontend service runs on port 8080.

## Fixes Applied

### 1. Enhanced CORS Configuration (`backend/src/server.js`)
- **Changed:** Updated CORS to accept multiple origins dynamically
- **Added Support For:**
  - `http://localhost:3000` (local dev)
  - `http://localhost:8080` (local nginx)
  - `http://localhost:30022` (NodePort access)
  - Dynamic IP-based NodePort access patterns
  - Requests without origin (mobile apps, API tools)

### 2. Kubernetes Backend Configuration (`k8s/bookstore-backend.yaml`)
- **Changed:** `FRONTEND_URL` from port 3000 to 8080
- **Before:** `value: "http://bookstore-frontend:3000"`
- **After:** `value: "http://bookstore-frontend:8080"`

## Deployment Steps

### Step 1: Rebuild Backend Docker Image
```bash
cd backend
docker build -t mokadir/bookstore-backend:12 .
docker push mokadir/bookstore-backend:12
```

### Step 2: Update Kubernetes Deployment
```bash
# Update the image version in k8s/bookstore-backend.yaml to :12
kubectl apply -f k8s/bookstore-backend.yaml
```

### Step 3: Restart Backend Pods
```bash
kubectl rollout restart deployment/bookstore-backend -n ns-bookstoreapp
kubectl rollout status deployment/bookstore-backend -n ns-bookstoreapp
```

### Step 4: Verify Fix
```bash
# Check backend logs
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=50

# Test the application
# Access: http://localhost:30022 or http://<your-ip>:30022
```

## Testing Checklist

- [ ] Backend pod is running and healthy
- [ ] Frontend can access backend API through nginx proxy
- [ ] Registration creates new users successfully
- [ ] Login authenticates existing users successfully
- [ ] No CORS errors in browser console
- [ ] JWT token is properly stored in localStorage
- [ ] Protected routes work after authentication

## Technical Details

### CORS Origin Validation Flow
1. Browser sends preflight OPTIONS request with Origin header
2. Backend checks origin against allowedOrigins array (strings and regex patterns)
3. If origin matches, responds with appropriate CORS headers
4. Browser allows the actual request to proceed

### Nginx Proxy Configuration
- Frontend nginx proxies `/api/*` requests to `http://bookstore-backend:5000`
- This creates a same-origin request from the browser's perspective
- Backend still validates CORS for direct API access

## Additional Notes

- The fix maintains security by validating origins while allowing necessary access patterns
- Both local development and Kubernetes deployment are supported
- The solution is production-ready with proper error handling
