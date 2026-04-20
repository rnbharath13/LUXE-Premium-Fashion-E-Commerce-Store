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
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Install & run:
```bash
npm install
npm run dev
```

## 4. Configure Frontend
Create `src/.env.local`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
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
