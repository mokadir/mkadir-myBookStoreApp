#!/bin/bash
# Deploy Authentication Fix for BookStore App

echo "=========================================="
echo "BookStore App - Authentication Fix Deployment"
echo "=========================================="

# Step 1: Build the updated backend image
echo ""
echo "[Step 1/4] Building updated backend Docker image..."
cd backend
docker build -t mokadir/bookstore-backend:12 .

if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed!"
    exit 1
fi

# Step 2: Push to Docker registry
echo ""
echo "[Step 2/4] Pushing image to Docker registry..."
docker push mokadir/bookstore-backend:12

if [ $? -ne 0 ]; then
    echo "ERROR: Docker push failed!"
    exit 1
fi

# Step 3: Update Kubernetes deployment image version
echo ""
echo "[Step 3/4] Updating Kubernetes deployment..."
cd ..
kubectl set image deployment/bookstore-backend bookstore-backend=mokadir/bookstore-backend:12 -n ns-bookstoreapp

if [ $? -ne 0 ]; then
    echo "ERROR: Kubernetes update failed!"
    exit 1
fi

# Apply the updated FRONTEND_URL configuration
kubectl apply -f k8s/bookstore-backend.yaml

# Step 4: Wait for rollout to complete
echo ""
echo "[Step 4/4] Waiting for deployment to complete..."
kubectl rollout status deployment/bookstore-backend -n ns-bookstoreapp

# Verify pods are running
echo ""
echo "=========================================="
echo "Deployment Status:"
echo "=========================================="
kubectl get pods -n ns-bookstoreapp -l app=bookstore-backend

# Show recent logs
echo ""
echo "=========================================="
echo "Backend Logs (last 20 lines):"
echo "=========================================="
kubectl logs -n ns-bookstoreapp -l app=bookstore-backend --tail=20

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Test the application at: http://localhost:30022"
echo ""
echo "Try logging in with demo credentials:"
echo "  Email: john@example.com"
echo "  Password: customer123"
echo ""
