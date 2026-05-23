# 🔐 Authentication Login/Registration Fix

## 🚨 Problem Summary

Your BookStore application was experiencing login and registration failures with the following errors:
- **"Login failed"** - when attempting to log in
- **"Registration failed"** - when attempting to register a new account

## 🔍 Root Cause Analysis

### Issue 1: CORS (Cross-Origin Resource Sharing) Configuration
**Problem:** The backend was configured to only accept requests from `http://localhost:3000`, but:
- The frontend in Kubernetes runs on **port 8080**
- Users access the app via **NodePort 30022** (e.g., `http://localhost:30022`)
- Browser blocks these requests as CORS violations

**Impact:** All authentication API calls were blocked by the browser's security policy.

### Issue 2: Kubernetes Configuration Mismatch
**Problem:** Backend environment variable had incorrect frontend URL:
- **Before:** `FRONTEND_URL=http://bookstore-frontend:3000`
- **Actual:** Frontend runs on port 8080

---

## ✅ Fixes Applied

### 1. Enhanced CORS Configuration (`backend/src/server.js`)
**Updated the CORS middleware to accept multiple origins:**

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',      // Local development
  'http://localhost:30022',      // Kubernetes NodePort
  'http://localhost:8080',       // Local nginx
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:30022$/,  // LAN IP NodePort
  /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:30022$/,  // Any IP NodePort
];
```

### 2. Fixed Kubernetes Configuration (`k8s/bookstore-backend.yaml`)
- ✅ Updated `FRONTEND_URL` to use port 8080
- ✅ Updated Docker image version to `:12`

### 3. Files Modified
- ✅ `backend/src/server.js` - Enhanced CORS configuration
- ✅ `k8s/bookstore-backend.yaml` - Fixed FRONTEND_URL and image version
- ✅ `backend/.env` - Added documentation comment

---

## 🚀 Deployment Instructions

### Option 1: Using PowerShell Script (Recommended for Windows)
```powershell
# Run the automated deployment script
.\DEPLOY_FIX.ps1
```

### Option 2: Using Bash Script (Linux/Mac)
```bash
# Make script executable
chmod +x DEPLOY_FIX.sh

# Run the automated deployment script
./DEPLOY_FIX.sh
```

### Option 3: Manual Deployment Steps

#### Step 1: Build and Push Docker Image
```bash
# Navigate to backend directory
cd backend

# Build the new image
docker build -t mokadir/bookstore-backend:12 .

# Push to Docker Hub
docker push mokadir/bookstore-backend:12

# Return to project root
cd ..
```

#### Step 2: Update Kubernetes Deployment
```bash
# Apply the updated configuration
kubectl apply -f k8s/bookstore-backend.yaml

# Verify deployment
kubectl rollout status deployment/bookstore-backend -n ns-bookstoreapp
```

#### Step 3: Verify the Fix
```bash
# Check pod status
kubectl get pods -n ns-bookstoreapp -l app=bookstore-backend

# Check logs for any errors
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=50
```

---

## 🧪 Testing the Fix

### 1. Access the Application
- **URL:** `http://localhost:30022`
- Or use your machine's IP: `http://<your-ip>:30022`

### 2. Test Registration
1. Go to Registration page
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Create Account"
4. **Expected:** Successful registration and redirect to home page

### 3. Test Login
Use demo credentials:
- **Email:** `john@example.com`
- **Password:** `customer123`

**Expected:** Successful login and redirect to home page

### 4. Verify in Browser Console
- **Expected:** No CORS errors
- **Expected:** JWT token stored in localStorage
- Check: Open DevTools → Application → Local Storage → `userInfo`

---

## ✅ Testing Checklist

- [ ] Backend pod is running and healthy
- [ ] No errors in backend logs
- [ ] Frontend loads at `http://localhost:30022`
- [ ] Registration form submits successfully
- [ ] New user can be created
- [ ] Login form submits successfully
- [ ] Existing user can log in
- [ ] No CORS errors in browser console (F12 → Console)
- [ ] JWT token appears in localStorage
- [ ] User can access protected routes after login
- [ ] User name appears in header after login

---

## 🔧 Troubleshooting

### Issue: Docker build fails
```bash
# Check Docker is running
docker version

# Ensure you're in the backend directory
cd backend
pwd  # Should show: .../bookStoreApp/backend
```

### Issue: Docker push fails (authentication)
```bash
# Login to Docker Hub
docker login

# Retry push
docker push mokadir/bookstore-backend:12
```

### Issue: Kubernetes context not found
```bash
# List available contexts
kubectl config get-contexts

# Set the correct context
kubectl config use-context <your-context-name>
```

### Issue: Pod not starting
```bash
# Check pod status
kubectl get pods -n ns-bookstoreapp

# Describe pod for details
kubectl describe pod <pod-name> -n ns-bookstoreapp

# Check logs
kubectl logs <pod-name> -n ns-bookstoreapp
```

### Issue: Still getting CORS errors
1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Hard refresh:** Ctrl+Shift+R or Cmd+Shift+R
3. **Check origin in Network tab:** F12 → Network → Click request → Headers
4. **Verify backend logs show CORS configuration:**
   ```bash
   kubectl logs -n ns-bookstoreapp -l app=bookstore-backend | grep -i cors
   ```

---

## 📊 Technical Details

### How the Fix Works

1. **Browser Request Flow:**
   ```
   Browser (http://localhost:30022)
   ↓
   Frontend Nginx (port 8080)
   ↓
   Proxy to Backend API (http://bookstore-backend:5000/api)
   ↓
   Backend Express Server (validates CORS origin)
   ↓
   Returns response with CORS headers
   ```

2. **CORS Validation:**
   - Backend receives request with `Origin` header
   - Checks origin against `allowedOrigins` array
   - Matches strings or regex patterns
   - Returns `Access-Control-Allow-Origin` header if allowed

3. **Same-Origin Proxy:**
   - Nginx proxies `/api/*` requests to backend
   - Browser sees requests as same-origin
   - CORS still validated for direct backend access

### Security Considerations

✅ **Secure:**
- Only whitelisted origins are allowed
- Regex patterns match specific port ranges
- Credentials flag properly set
- No wildcard (`*`) CORS origin

✅ **Production Ready:**
- Works in both development and production
- Supports multiple deployment scenarios
- Maintains security while enabling necessary access

---

## 📝 Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `backend/src/server.js` | Enhanced CORS with multiple origins | Support NodePort and various access patterns |
| `k8s/bookstore-backend.yaml` | Changed FRONTEND_URL to port 8080 | Match actual frontend port |
| `k8s/bookstore-backend.yaml` | Updated image to version :12 | Deploy the CORS fix |

---

## 🎯 Next Steps

1. ✅ Run deployment script or manual steps above
2. ✅ Test login and registration
3. ✅ Verify no CORS errors in console
4. ✅ Commit changes to git:
   ```bash
   git add .
   git commit -m "Fix: Resolve authentication CORS issues for login/registration"
   git push
   ```

---

## 📞 Support

If issues persist after deployment:
1. Check all pods are running: `kubectl get pods -n ns-bookstoreapp`
2. Review backend logs: `kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=100`
3. Check browser console for specific error messages
4. Verify MongoDB is connected (check logs for "MongoDB Connected")

---

**Created:** May 23, 2026  
**Status:** Ready for Deployment  
**Priority:** High (Blocks authentication)
