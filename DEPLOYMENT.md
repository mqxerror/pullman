# Pullman Hotel Website - Deployment Guide

**Last Updated:** January 21, 2026
**Live URL:** https://pullman.mercan.com
**Repository:** https://github.com/mqxerror/pullman

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Methods](#deployment-methods)
4. [Auto-Deploy Setup (GitHub → Dokploy)](#auto-deploy-setup)
5. [Manual Deployment](#manual-deployment)
6. [Dokploy Configuration](#dokploy-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Quick Reference Commands](#quick-reference-commands)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  GitHub Repo    │────▶│    Dokploy       │────▶│  Docker Swarm       │
│  mqxerror/      │     │  (Port 3000)     │     │  Service            │
│  pullman        │     │                  │     │  (Port 3082:80)     │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  User Browser   │◀────│  Nginx Proxy     │◀────│  SSL/Let's Encrypt  │
│                 │     │  (Host)          │     │                     │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

**Stack:**
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (database & API)
- **Container:** Docker with multi-stage build (Node.js → Nginx)
- **Orchestration:** Docker Swarm via Dokploy
- **Proxy:** Nginx with SSL (Let's Encrypt)
- **Server:** 38.97.60.181 (RackNerd)

---

## Prerequisites

### Server Access
```bash
ssh -p 2222 root@38.97.60.181
# Password: 3F68ypfD1LOfcAd
```

### Required Services
| Service | URL | Purpose |
|---------|-----|---------|
| Dokploy | http://38.97.60.181:3000 | Container orchestration |
| Supabase API | http://38.97.60.181:8000 | Database & REST API |
| Supabase Studio | http://38.97.60.181:3002 | Database UI |

### API Keys
```bash
# Dokploy API Key
qaBFTnweBNakQRcFNdQyFbsfnYhGxaKlDRDnhqtdfEdSrwOVmJJTofWXiVKHEYgC

# Supabase Anon Key (used in app)
eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3MDAwMDAwMDAsICJleHAiOiAyMDAwMDAwMDAwfQ.dwquv_XjdVzN3DystbMAfy1KI3VS0zNdb-up3TUtCYA
```

---

## Deployment Methods

### Method 1: Auto-Deploy (Recommended)
Push to `main` branch → GitHub webhook triggers Dokploy → Automatic rebuild & deploy

### Method 2: Manual Deploy via Dokploy API
Trigger deployment without pushing code

### Method 3: Direct Docker Deploy
SSH to server and manually build/deploy (emergency only)

---

## Auto-Deploy Setup

### GitHub Webhook Configuration

**Webhook URL:**
```
http://38.97.60.181:3000/api/deploy/vwZ8CEVBczDxB62UTo3q-
```

**Setup Steps:**
1. Go to https://github.com/mqxerror/pullman/settings/hooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL:** `http://38.97.60.181:3000/api/deploy/vwZ8CEVBczDxB62UTo3q-`
   - **Content type:** `application/json`
   - **Events:** Just the push event
   - **Active:** ✓

**Verify webhook is working:**
```bash
# Test webhook manually
curl -X POST "http://38.97.60.181:3000/api/deploy/vwZ8CEVBczDxB62UTo3q-" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/main", "repository": {"full_name": "mqxerror/pullman"}}'
```

### How Auto-Deploy Works

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: Your changes"
   git push origin main
   ```

2. **Dokploy receives webhook** and:
   - Clones the repository
   - Runs `docker build` using the Dockerfile
   - Creates new Docker image
   - Updates the Swarm service

3. **Service restarts** with new code (zero-downtime rolling update)

---

## Manual Deployment

### Option A: Trigger via Dokploy API

```bash
# Trigger redeploy
curl -X POST "http://38.97.60.181:3000/api/application.redeploy" \
  -H "Content-Type: application/json" \
  -H "x-api-key: qaBFTnweBNakQRcFNdQyFbsfnYhGxaKlDRDnhqtdfEdSrwOVmJJTofWXiVKHEYgC" \
  -d '{"applicationId": "26-msDm_MjerBIRJJIxY7"}'
```

### Option B: Direct Server Deployment (Emergency)

Use this if Dokploy build fails or for quick hotfixes:

```bash
# 1. Build locally
cd "C:\Users\Wassim\Downloads\Pnama Project\PullMan Hotel"
npm run build

# 2. Create tarball of dist folder
tar -cvzf pullman-dist.tar.gz -C dist .

# 3. Upload to server
scp -P 2222 pullman-dist.tar.gz root@38.97.60.181:/tmp/

# 4. SSH to server and deploy
ssh -p 2222 root@38.97.60.181

# 5. On server: Extract and rebuild
cd /etc/dokploy/applications/app-index-auxiliary-microchip-obn4wr/code
rm -rf assets index.html
tar -xvzf /tmp/pullman-dist.tar.gz

# 6. Create simple Dockerfile (if missing)
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 7. Create nginx.conf (if missing)
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 8. Rebuild Docker image
docker build -t app-index-auxiliary-microchip-obn4wr:latest .

# 9. Update the service
docker service update --force app-index-auxiliary-microchip-obn4wr
```

---

## Dokploy Configuration

### Application Details

| Property | Value |
|----------|-------|
| **Application ID** | `26-msDm_MjerBIRJJIxY7` |
| **App Name** | `app-index-auxiliary-microchip-obn4wr` |
| **Project** | Pullman Hotel |
| **Environment** | production |
| **Build Type** | Dockerfile |
| **Branch** | main |
| **Domain** | pullman.mercan.com |

### Required Port Mapping

**IMPORTANT:** Dokploy must have port 3082:80 configured, otherwise the app won't be accessible after redeploy.

**To add port in Dokploy UI:**
1. Go to http://38.97.60.181:3000
2. Navigate to: Projects → Pullman Hotel → pullman-website
3. Go to: Advanced → Ports
4. Add port mapping: `3082` → `80` (TCP)
5. Click Save & Redeploy

**To add port via command line (if UI fails):**
```bash
ssh -p 2222 root@38.97.60.181 \
  'docker service update --publish-add 3082:80 app-index-auxiliary-microchip-obn4wr'
```

### Environment Variables (in Dokploy)

```env
VITE_SUPABASE_URL=http://38.97.60.181:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3MDAwMDAwMDAsICJleHAiOiAyMDAwMDAwMDAwfQ.dwquv_XjdVzN3DystbMAfy1KI3VS0zNdb-up3TUtCYA
NODE_ENV=production
```

---

## Troubleshooting

### Problem: 502 Bad Gateway

**Cause:** Port mapping missing after Dokploy redeploy

**Solution:**
```bash
# Add port mapping
ssh -p 2222 root@38.97.60.181 \
  'docker service update --publish-add 3082:80 app-index-auxiliary-microchip-obn4wr'

# Verify
curl -s -o /dev/null -w "%{http_code}" https://pullman.mercan.com
# Should return: 200
```

### Problem: Build Fails in Dokploy

**Cause:** npm install or build process failing

**Check logs:**
```bash
# View recent deployments in Dokploy UI or check Docker logs
ssh -p 2222 root@38.97.60.181 \
  'docker service logs app-index-auxiliary-microchip-obn4wr --tail 100'
```

**Solution:** Use manual deployment (Option B above) as workaround

### Problem: Webhook Not Triggering

**Verify webhook status:**
1. Go to https://github.com/mqxerror/pullman/settings/hooks
2. Click on the webhook
3. Check "Recent Deliveries" for errors

**Test manually:**
```bash
curl -X POST "http://38.97.60.181:3000/api/deploy/vwZ8CEVBczDxB62UTo3q-" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/main", "repository": {"full_name": "mqxerror/pullman"}}'

# Should return: {"message":"Application deployed successfully"}
```

### Problem: Service Not Starting

**Check service status:**
```bash
ssh -p 2222 root@38.97.60.181 'docker service ls | grep pullman'
ssh -p 2222 root@38.97.60.181 'docker service ps app-index-auxiliary-microchip-obn4wr'
```

**Force restart:**
```bash
ssh -p 2222 root@38.97.60.181 \
  'docker service update --force app-index-auxiliary-microchip-obn4wr'
```

### Problem: Old Cache Showing

**Clear browser cache** or **hard refresh** (Ctrl+Shift+R)

**Verify new build is deployed:**
```bash
# Check the JS filename in the response - it should match latest build
curl -s https://pullman.mercan.com | grep "index-"
```

---

## Quick Reference Commands

### Check Status
```bash
# Website HTTP status
curl -s -o /dev/null -w "%{http_code}" https://pullman.mercan.com

# Docker service status
ssh -p 2222 root@38.97.60.181 'docker service ls | grep pullman'

# Container logs
ssh -p 2222 root@38.97.60.181 'docker service logs app-index-auxiliary-microchip-obn4wr --tail 50'
```

### Deploy
```bash
# Via Git (auto-deploy)
git push origin main

# Via API
curl -X POST "http://38.97.60.181:3000/api/deploy/vwZ8CEVBczDxB62UTo3q-" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/main", "repository": {"full_name": "mqxerror/pullman"}}'
```

### Fix Port Mapping
```bash
ssh -p 2222 root@38.97.60.181 \
  'docker service update --publish-add 3082:80 app-index-auxiliary-microchip-obn4wr'
```

### Restart Service
```bash
ssh -p 2222 root@38.97.60.181 \
  'docker service update --force app-index-auxiliary-microchip-obn4wr'
```

### View All Services
```bash
ssh -p 2222 root@38.97.60.181 \
  'docker service ls --format "table {{.Name}}\t{{.Replicas}}\t{{.Ports}}"'
```

---

## File Structure

```
PullMan Hotel/
├── src/                    # React source code
├── public/                 # Static assets
├── dist/                   # Built files (generated)
├── Dockerfile              # Multi-stage build config
├── nginx.conf              # Nginx server config
├── .dockerignore           # Docker build exclusions
├── package.json            # Dependencies
├── vite.config.ts          # Vite build config
├── DEPLOYMENT.md           # This file
└── ...
```

---

## Important Notes

1. **Never commit secrets** to the repository - use Dokploy environment variables

2. **Port 3082 must be configured in Dokploy** - otherwise it gets lost on redeploy

3. **The Dockerfile uses multi-stage build** - it runs npm install and build inside Docker, so you don't need to commit the dist folder

4. **SSL is managed by Let's Encrypt** via Dokploy/Traefik - no manual certificate management needed

5. **Supabase connection** - the app connects to the local Supabase instance at 38.97.60.181:8000

---

## Support

- **Server Infrastructure:** See `SERVER_INFRASTRUCTURE_REFERENCE.md`
- **Dokploy Dashboard:** http://38.97.60.181:3000
- **GitHub Repo:** https://github.com/mqxerror/pullman
