# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Create new project
4. Copy your `Project URL` and `Anon Key`

## 2. Run Database Schema
In Supabase dashboard → SQL Editor → New Query

Paste contents of `SUPABASE_SCHEMA.sql` and run.

## 3. Configure Backend
```bash
cd server
cp .env.example .env
```

Update `.env`:
```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
FRONTEND_URL=http://localhost:5173
```

Install & run:
```bash
npm install
npm run dev
```

## 4. Configure Frontend
Create `.env` in the project root:
```
VITE_API_URL=http://localhost:5000/api
```

## 5. Start Dev Servers
Terminal 1 (Backend):
```bash
cd server && npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

Server: `http://localhost:5000`
Frontend: `http://localhost:5173`
