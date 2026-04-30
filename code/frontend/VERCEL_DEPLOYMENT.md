# Vercel Deployment Guide

## Quick Start

### Prerequisites

- GitHub account
- Vercel account (free: https://vercel.com/signup)
- Your backend running somewhere (local/Heroku/etc.)

---

## **Deployment Process**

### **Step 1: Push Code to GitHub**

```bash
cd c:\Users\erand\Downloads\Programs\e22-co2060-Patient-Management-System
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### **Step 2: Import Project to Vercel**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repo URL
5. Click **"Import"**

### **Step 3: Configure Deployment Settings**

**Important: Set the correct root directory!**

- **Root Directory:** `code/frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (should auto-detect)
- **Output Directory:** `dist`

### **Step 4: Set Environment Variables**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Add this variable:**

```
VITE_API_URL = https://your-backend-url.com:8080
```

Replace `https://your-backend-url.com` with your actual backend URL:

- **Local testing:** `http://localhost:8080`
- **Heroku backend:** `https://your-heroku-app.herokuapp.com`
- **Your server:** Your actual backend domain

### **Step 5: Deploy**

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-2 minutes)
3. Get your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## **Troubleshooting**

### **API calls failing (CORS error)**

- Ensure `VITE_API_URL` environment variable is set correctly
- Backend should have CORS enabled for your Vercel URL

### **Build fails**

- Check that `code/frontend` is the root directory
- Ensure `package.json` exists in that folder
- Run `npm install` and `npm run build` locally to test

### **Seeing old site after deploy**

- Clear browser cache (Ctrl+Shift+Delete)
- Wait 2-3 minutes for Vercel CDN to update

---

## **Production Considerations**

1. **API Base URL:** Use environment variables, NOT hardcoded URLs
2. **CORS:** Update your Spring Boot backend CORS config with your Vercel domain
3. **Token Management:** JWT tokens in localStorage should work fine
4. **Updates:** Push to GitHub → Vercel auto-deploys

---

## **Connect Backend CORS (Spring Boot)**

Update `code/backend/src/main/java/com/pms/backend/config/...` (CORS config):

```java
.allowedOrigins("https://your-app.vercel.app", "http://localhost:3000")
```

---

## **Need Help?**

- Vercel Docs: https://vercel.com/docs
- React + Vite Guide: https://vitejs.dev/guide/
