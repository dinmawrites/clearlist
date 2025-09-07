# Deployment Guide for Clearlist

## Prerequisites
1. Supabase account and project
2. GitHub account
3. Vercel account

## Step 1: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually 2-3 minutes)
3. Go to Settings → API to get your project URL and anon key
4. Go to SQL Editor and run this SQL:

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  categories JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own todos
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 2: Setup Environment Variables

Create a `.env.local` file in your project root:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Test Locally

```bash
npm start
```

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
6. Deploy!

## Step 5: Configure Supabase Auth

1. Go to Authentication → Settings in Supabase
2. Add your Vercel domain to "Site URL"
3. Add your Vercel domain to "Redirect URLs"

## Features After Deployment

✅ **Multi-device Sync**: Todos sync across all devices
✅ **User Authentication**: Secure signup/login
✅ **Real-time Updates**: Changes appear instantly
✅ **Data Persistence**: No more lost data
✅ **Scalable**: Can handle thousands of users

## Cost

- **Vercel**: Free for personal projects
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **Total**: $0/month for small to medium usage
