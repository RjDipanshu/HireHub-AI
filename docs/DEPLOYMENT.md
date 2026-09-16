# HireHub AI — Production Deployment Guide & Runbook

This runbook details the exact procedures for deploying HireHub AI to production across modern cloud infrastructure.

---

## 1. Quick Production Deployment with Docker Compose

For a unified virtual server (DigitalOcean Droplet, AWS EC2, Hetzner, or Linode):

### 1.1 Server Preparation
```bash
# Update server packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 1.2 Clone Repository & Configure Environment
```bash
git clone https://github.com/RjDipanshu/HireHub-AI.git
cd HireHub-AI

# Create production environment file
cp .env.docker.example .env
nano .env
```
Ensure the following variables are configured:
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://db.<your-supabase-ref>.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<your-secure-password>
SUPABASE_JWT_ISSUER=https://<your-supabase-ref>.supabase.co/auth/v1
SUPABASE_JWK_SET_URI=https://<your-supabase-ref>.supabase.co/auth/v1/.well-known/jwks.json
GEMINI_API_KEY=<your-google-gemini-api-key>
VITE_SUPABASE_URL=https://<your-supabase-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 1.3 Build and Launch Containers
```bash
docker compose build --no-cache
docker compose up -d
```

### 1.4 Validate Deployment Health
```bash
# Verify containers are running
docker compose ps

# Check frontend health
curl -I http://localhost/healthz

# Check backend health
curl -I http://localhost:8080/actuator/health
```

---

## 2. Cloud PaaS Deployment (Render / Railway)

### 2.1 Backend Service (Spring Boot)
1. In Render/Railway dashboard, choose **New Web Service** &rarr; Connect GitHub repo.
2. Root Directory: `backend/hirehub-backend/hirehub-backend`.
3. Environment: **Docker** (detects Dockerfile).
4. Port: `8080`.
5. Health Check Path: `/actuator/health`.
6. Add Environment Variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `SPRING_DATASOURCE_URL=...`
   - `SPRING_DATASOURCE_PASSWORD=...`
   - `SUPABASE_JWT_ISSUER=...`
   - `SUPABASE_JWK_SET_URI=...`
   - `GEMINI_API_KEY=...`
   - `CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>`

### 2.2 Frontend Service (React + Vite)
1. Choose **New Static Site** or **Docker Web Service** pointing to `./frontend`.
2. For Static Site:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add Rewrite Rule: `/*` &rarr; `/index.html`
3. Environment Variables:
   - `VITE_SUPABASE_URL=https://<ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_API_BASE_URL=https://<backend-service-url>/api/v1`

---

## 3. Supabase Storage Policies Setup

Execute the SQL policies in [`docs/supabase_storage_resumes_policies.sql`](file:///c:/Users/dipan/OneDrive/Desktop/HireHub/docs/supabase_storage_resumes_policies.sql) in your Supabase SQL Editor:
- Creates private `resumes` bucket with 10MB file limit.
- Restricts folder access to candidate owner:
  ```sql
  CREATE POLICY "Candidate Upload Access"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
      bucket_id = 'resumes' AND
      (storage.foldername(name))[1] = 'candidate' AND
      auth.uid()::text = (storage.foldername(name))[2]
  );
  ```

---

## 4. SSL/TLS & Custom Domain Setup

- Configure DNS `A` records to point to your server IP.
- Point Cloudflare to your domain and enable **Full (Strict) SSL**.
- Set HTTPS headers in Nginx to redirect HTTP traffic to HTTPS.

---

## 5. Post-Deployment Verification Checklist

- [ ] `GET /healthz` returns `200 healthy`
- [ ] `GET /actuator/health` returns `{"status":"UP"}`
- [ ] `GET /swagger-ui.html` renders interactive API documentation
- [ ] Sign in with test candidate account and verify profile synchronization
- [ ] Upload sample resume and verify 5-factor ATS score computation
- [ ] Apply to sample job and confirm in-app notification appears
