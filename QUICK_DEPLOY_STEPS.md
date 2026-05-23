# Quick Deployment Steps

## Step 1: Build the Backend Image
```bash
cd backend
docker build -t mokadir/bookstore-backend:12 .
```

## Step 2: Push to Docker Hub
```bash
docker push mokadir/bookstore-backend:12
```

## Step 3: Update Kubernetes
```bash
cd ..
kubectl apply -f k8s/bookstore-backend.yaml
```

## Step 4: Verify Deployment
```bash
# Wait for new pods
kubectl rollout status deployment/bookstore-backend -n ns-bookstoreapp

# Check logs for new CORS message
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=20
```

## Step 5: Test
- Go to http://localhost:30022
- Try login or registration
- Check browser console (F12) - should see no CORS errors
