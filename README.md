# Clearlist - A Modern Todo App

A beautiful, feature-rich todo application built with React, TypeScript, and Supabase. Organize your tasks with priorities, categories, and multi-device sync.

## Features

- ✅ **Multi-device Sync**: Access your todos from any device
- 🎯 **Priority Management**: Set and change priorities with hover menu
- 🏷️ **Category System**: Organize tasks with colored categories
- 🔍 **Search & Filter**: Find tasks quickly
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 👤 **User Authentication**: Secure user accounts

## Setup Instructions

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd notion-todo-app
npm install
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run this SQL in your Supabase SQL editor:

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

### 4. Run the App
```bash
npm start
```

## Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Add the same environment variables in Vercel dashboard
4. Deploy!

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
