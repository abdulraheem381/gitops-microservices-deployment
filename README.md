# Raheem Boutique

A complete production-ready microservices e-commerce application demonstrating modern DevOps and Cloud-Native best practices, built specifically for a DevOps portfolio demo.

## Architecture

This application consists of 5 independent microservices:

1. **Frontend**: Next.js 15 (React) with Tailwind CSS. Provides a modern, responsive UI for users to browse products and place orders.
2. **Catalog Service**: Node.js/Express. Manages product data.
3. **Cart Service**: Node.js/Express. Manages user carts (session/ID-based).
4. **Order Service**: Node.js/Express. Handles order creation and triggers payment processing.
5. **Payment Service**: Node.js/Express. A mock service that simulates payment processing and always succeeds.

## Features

- **Microservices Design**: Decoupled architecture communicating via REST APIs.
- **Containerization**: Multi-stage Dockerfiles optimized for production, reducing image sizes.
- **Kubernetes Ready**: Complete basic YAML manifests (Deployments, Services, HPAs) ready for GitOps (e.g., ArgoCD) and cloud deployment (e.g., GKE).
- **Docker Compose**: Pre-configured setup for local development and testing.
- **Modern Frontend**: Latest Next.js (App Router) combined with Tailwind CSS for premium responsive aesthetics.

## Local Development

You can run the entire stack locally using Docker Compose:

```bash
# Build and run all services
docker-compose up --build

# Once running, open your browser at:
# Frontend UI: http://localhost:3000
```

## Kubernetes Deployment

The `k8s/` directory contains all necessary manifests to deploy this application to a Kubernetes cluster.

```bash
kubectl apply -f k8s/
```

### Manifests Included

For each service (Frontend, Catalog, Cart, Order, Payment), the following resources are defined:
- **Deployment**: Ensures your pods run as requested with readiness/liveness probes and defined resource limits.
- **Service**: Internal routing and load balancing. (Frontend is exposed as an external LoadBalancer).
- **HorizontalPodAutoscaler (HPA)**: Auto-scales pods when CPU utilization crosses 70%.
